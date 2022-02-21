'use strict';

//Проверка на число
const isNumber = (n) => !isNaN(parseFloat(n)) && isFinite(n);

const calcButton = document.getElementById('start'), //Кнопка "Рассчитать"
      resetButton = document.getElementById('cancel'), //Кнопка "Сбросить"
      
      // btnPlus = document.getElementsByTagName('button'), 
      
      checkboxDeposit = document.querySelector('#deposit-check'), //Чекбокс депозит
      inputAdditionalIncome = document.querySelectorAll('.additional_income-item'), //Поля для ввода возможных доходов
      budgetMonth = document.getElementsByClassName('budget_month-value')[0], //Доход за месяц (итог)
      budgetDay = document.getElementsByClassName('budget_day-value')[0], //Дневной бюджет (итог)
      expensesMonth = document.getElementsByClassName('expenses_month-value')[0], //Расход за месяц (итог)
      additionalIncome = document.getElementsByClassName('additional_income-value')[0], //Возможные доходы (итог)
      additionalExpenses = document.getElementsByClassName('additional_expenses-value')[0], //Возможные расходы (итог)
      incomePeriod = document.getElementsByClassName('income_period-value')[0], //Накопления за период (итог)
      targetMonth = document.getElementsByClassName('target_month-value')[0], //Срок достижения цели (итог)
      inputSalaryMonth = document.querySelector('.salary-amount'), //Месячный доход (Поле для ввода)
      inputAdditionalExpenses = document.querySelector('.additional_expenses-item'), //Возможные расходы (Поле для ввода)
      inputTargetAmount = document.querySelector('.target-amount'), //Сумма цели (Поле для ввода)
      selectPeriod = document.querySelector('.period-select'), //Период расчета (ползунок)
      periodAmount = document.querySelector('.period-amount'), //Период расчета (значение)
      data = document.querySelector('.data'), //Все инпуты ввода (для их отключения)
      allInputs = document.querySelectorAll('input'),
      checkBoxFon = document.querySelector('.deposit-checkmark'), //Фон чек-бокса (Для установки стилей для заблокированного/разблокированного чек-бокса)
      allBtn = document.querySelectorAll('button'), //Все кнопки на странице (Для установки стилей для заблокированных/разблокированных кнопок)
      depositBank = document.querySelector('.deposit-bank'),
      depositAmount = document.querySelector('.deposit-amount'),
      depositPercent = document.querySelector('.deposit-percent');

let incomeItems = document.querySelectorAll('.income-items'), //Поля дополнительных доходов    
    placeholderText = data.querySelectorAll('input[placeholder="Наименование"]'),
    placeholderSum = data.querySelectorAll('input[placeholder="Сумма"]'),
    expensesItems = document.querySelectorAll('.expenses-items'), //Поля обязательных расходов
    btnPlus = document.querySelectorAll('.btn_plus'), //Кнопки + (плюс)
    incomePlus = btnPlus[0],
    expensesPlus = btnPlus[1],
    disInput = data.querySelectorAll('input[type="text"]');

class AppData {
   constructor(){
      this.budget = 0; 
      this.income = {};
      this.addIncome = [];
      this.expenses = {};
      this.addExpenses = [];
      this.deposit = false;
      this.percentDeposit = 0;
      this.moneyDeposit = 0;
      this.budgetDay = 0;
      this.budgetMonth = 0;
      this.expensesMonth = 0; 
      this.tsargetMonth = 0;
      this.incomeMonth = 0;
   };

   start () {
      //Месячный доход
      this.budget = +inputSalaryMonth.value;

      this.getExpInc();
      this.getExpensesMonth(); 
      this.getInfoDeposit();              
      this.addExpInc();
      this.getBudget();

      this.showResult();
                  
      //Блокировка input и кнопок "+" после нажатия "Расчитать". Пропадает кнопка "Расчитать", появляется кнока Сброса
      disInput = data.querySelectorAll('input[type="text"]');
      disInput.forEach((item) => {
         item.disabled = true;
      });
      incomePlus.disabled = true;
      expensesPlus.disabled = true;
      checkboxDeposit.disabled = true;
      depositBank.disabled = true;

      //Стили для заблокированного чек-бокса
      checkBoxFon.style.backgroundColor='red';
      checkBoxFon.style.cursor='not-allowed';

      calcButton.style.display = 'none';
      resetButton.style.display = 'block';

      //Изменение фона и курсора при заблокированных кнопках
      allBtn.forEach((elem) => {
         if (elem.hasAttribute('disabled')){
            elem.style.backgroundColor='red';
            elem.style.cursor='not-allowed';
         } else {
            elem.removeAttribute('style.backgroundColor');
            elem.removeAttribute('style.cursor');
         };
      });
   };

   showResult () {
      budgetMonth.value = this.budgetMonth;
      budgetDay.value = Math.floor(this.budgetDay);
      expensesMonth.value = this.expensesMonth;
      additionalExpenses.value = this.addExpenses.join(', ');
      additionalIncome.value = this.addIncome.join(', ');
      targetMonth.value = Math.ceil(this.getTargetMonth());
      incomePeriod.value = this.calcSavedMonth();
      //Динамическое изменение поля "Накопления за период" в зависимости от положения ползунка
      selectPeriod.addEventListener('input', () => {
         incomePeriod.value = this.calcSavedMonth();
      });
   };

   addBlock () {
      const startStr = this.className.split(' ')[1].split('_')[0]; // income || epenses
      let itemForClone = document.querySelectorAll(`.${startStr}-items`)[0]; //Получение элемента для клонирования
      const cloneItem = itemForClone.cloneNode(true); // Клонирование полученного элемента
      cloneItem.querySelectorAll('input').forEach((el) => { //Клонированный элемент без значения value
         el.value = '';
      });
      itemForClone.parentNode.insertBefore(cloneItem, this);
      itemForClone = document.querySelectorAll(`.${startStr}-items`);
      if(itemForClone.length === 3){
         this.style.display = 'none';
      };


      //Ввод только русских букв и знаков припенания в поля с Наименованием
      placeholderText = data.querySelectorAll('input[placeholder="Наименование"]').forEach((item) => {
         item.addEventListener('input', () => {
            item.value = item.value.replace(/[^,.А-Яа-я\s]/, ''); 
         });
      });
      
      //Ввод только цифр в поля с Суммой
      placeholderSum = data.querySelectorAll('input[placeholder="Сумма"]').forEach((item) => {
         item.addEventListener('keydown', (event) => {
         //Разрешаем вводить цифры с основной клавы и с дополнительной (num-клава)
         if(event.shiftKey){
            event.preventDefault();
         }  else if (event.keyCode == 46 || //Delete
            event.keyCode == 8 ||  //Backspace
            event.keyCode == 9 ||  //Tab
            event.keyCode == 27 ||  //Esc
            (event.keyCode == 65 && event.ctrlKey === true) || //CTRL + A
            (event.keyCode >= 35 && event.keyCode !== 38 && event.keyCode <= 39)){ //End, Home, стрелочка влево, стрелочка вправо
            return;
         }  else if ((event.keyCode < 48 || event.keyCode > 57) && (event.keyCode < 96 || event.keyCode > 105)){
               event.preventDefault(); //Все цифры на клавиатуре, в т.ч. и на num-клаве
            };
         });
      });
   };

   getExpInc () {
      const count = (item) => {
         const startStr = item.className.split('-')[0];
         const itemTitle = item.querySelector(`.${startStr}-title`).value;
         const itemAmount = item.querySelector(`.${startStr}-amount`).value;
         if(itemTitle !== '' && itemAmount !== ''){
            this[startStr][itemTitle] = itemAmount;
         };
      };

      expensesItems.forEach(count);
      incomeItems.forEach(count);

      for (let key in this.income){
         this.incomeMonth += +this.income[key]
      };
   };


   addExpInc () {
      const a = (item) => {
         const str = item.className.split('_')[1].split('-')[0];
         const addExpInc = document.querySelectorAll(`.additional_${str}-item`);
         if(addExpInc.length >= 2){
            item = item.value.trim();
            if(item !== ''){
               this.addIncome.push(item);
            };
         } else {
            item = item.value.trim().split(',');
            if(item !== ''){
               this.addExpenses.push(item);
            };
         }
      };

      inputAdditionalIncome.forEach(a);
      a(inputAdditionalExpenses);
   };
   
   getExpensesMonth () {
      for (let key in this.expenses){
         this.expensesMonth += +this.expenses[key];
      };
   };

   getBudget () {
      const monthDeposit = this.moneyDeposit * (this.percentDeposit / 100);
      this.budgetMonth = this.budget + this.incomeMonth - this.expensesMonth + monthDeposit;
      this.budgetDay = this.budgetMonth / 30;
   };

   getTargetMonth () {
      return inputTargetAmount.value / this.budgetMonth;
   }; 

   getInfoDeposit () {
      if(this.deposit){
         this.percentDeposit = depositPercent.value;
         this.moneyDeposit = depositAmount.value;  
      };
   };  

   calcSavedMonth () {
      return this.budgetMonth * selectPeriod.value;
   };    

   

   reset() {
      this.budget = 0; 
      this.income = {};
      this.addIncome = [];
      this.expenses = {};
      this.addExpenses = [];
      this.deposit = false;
      this.moneyDeposit = 0;
      this.budgetDay = 0;
      this.budgetMonth = 0;
      this.expensesMonth = 0;  
      this.tsargetMonth = 0;
      this.incomeMonth = 0;
      allInputs.forEach((item) => {
         item.value = '';
      });
      periodAmount.innerHTML = selectPeriod.value = '1';
      calcButton.style.display = 'block';
      resetButton.style.display = 'none';
      disInput.forEach((item) => {
         item.disabled = false;
      });

      expensesItems = document.querySelectorAll('.expenses-items');
      for (let i = 1; i < expensesItems.length; i++){
         expensesItems[i].parentNode.removeChild(expensesItems[i]);
         expensesPlus.style.display = 'block';
      };

      incomeItems = document.querySelectorAll('.income-items');
      for (let i = 1; i < incomeItems.length; i++){
         incomeItems[i].parentNode.removeChild(incomeItems[i]);
         incomePlus.style.display = 'block';
      };
      this.budget = +inputSalaryMonth.value;

      
      calcButton.disabled = true;
      incomePlus.disabled = false;
      expensesPlus.disabled = false;
      checkboxDeposit.disabled = false;
      checkboxDeposit.checked = false;
      depositBank.disabled = false;
      //Стили для разблокированного чек-бокса
      checkBoxFon.removeAttribute('style');
      //Изменение фона и курсора при разблокированных кнопках
      allBtn.forEach((elem) => {
         if (elem.hasAttribute('disabled')){
            elem.style.backgroundColor='red';
            elem.style.cursor='not-allowed';
         } else {
            elem.removeAttribute('style');
         };
      });
   };

   changePercent () {
      const valueSelect = this.value;
      if(valueSelect === 'other'){
         depositPercent.style.display = 'inline-block';
         depositPercent.addEventListener('input', () => {
            depositPercent.value = depositPercent.value.match(/\d*/); 
            if (depositPercent.value > 100) {
               alert('Введите корректное значение в поле проценты');
               calcButton.disabled = true;
               calcButton.style.backgroundColor='red';
               calcButton.style.cursor='not-allowed';
            } else {
               calcButton.disabled = false;
               calcButton.removeAttribute('style');
            };
         });
         depositPercent.value - valueSelect;
      } else {
         depositPercent.style.display = 'none';
         depositPercent.value = valueSelect;
      };
   };

   depositHandler () {
      if(checkboxDeposit.checked){
         depositBank.style.display = 'inline-block';
         depositAmount.style.display = 'inline-block';
         this.deposit = true;
         depositBank.addEventListener('change', this.changePercent);
      } else {
         depositBank.style.display = 'none';
         depositAmount.style.display = 'none';
         depositBank.value = '';
         depositAmount.value = '';
         this.deposit = false;
         depositBank.removeEventListener('change', this.changePercent);
      }
   };

   eventsListeners () {

      //Изменение значения ползунка при его перемещении
      selectPeriod.addEventListener('input', () => {
         periodAmount.innerHTML = selectPeriod.value;
      });

      //По клику на кнопку "Рассчитать" работает функция start
      calcButton.addEventListener('click', appData.start.bind(this)); 

      //По клику на кнопку "Сбросить" работает функция reset
      resetButton.addEventListener('click', appData.reset.bind(this));

      //По клику на кнопки "+" работает функция addExpensesBlock 
      incomePlus.addEventListener('click', appData.addBlock);
      expensesPlus.addEventListener('click', appData.addBlock);


      //Запрет нажатия кнопки "Расчитать" при пустом поле месячного дохода. Изменение фона и курсора
      calcButton.disabled = true;
      calcButton.style.backgroundColor='red';
      calcButton.style.cursor='not-allowed';
      inputSalaryMonth.addEventListener('input', () => {
         if (inputSalaryMonth.value !== ''){
            calcButton.disabled = false;
            calcButton.removeAttribute('style');
         } else {
            calcButton.disabled = true;
            calcButton.style.backgroundColor='red';
            calcButton.style.cursor='not-allowed';
         };
      });

      //Ввод только цифр в поля с Суммой
      placeholderSum.forEach((item) => {
         item.addEventListener('keydown', (event) => {
         //Разрешаем вводить цифры с основной клавы и с дополнительной (num-клава)
         if(event.shiftKey){
            event.preventDefault();
         }  else if (event.keyCode == 46 || //Delete
            event.keyCode == 8 ||  //Backspace
            event.keyCode == 9 ||  //Tab
            event.keyCode == 27 ||  //Esc
            (event.keyCode == 65 && event.ctrlKey === true) || //CTRL + A
            (event.keyCode >= 35 && event.keyCode !== 38 && event.keyCode <= 39)){ //End, Home, стрелочка влево, стрелочка вправо
            return;
         }  else if ((event.keyCode < 48 || event.keyCode > 57) && (event.keyCode < 96 || event.keyCode > 105)){
               event.preventDefault(); //Все цифры на клавиатуре, в т.ч. и на num-клаве
            };
         });
      });

      //Ввод только русских букв и знаков припенания в поля с Наименованием
      placeholderText.forEach((item) =>{
         item.addEventListener('input', () => {
            item.value = item.value.replace(/[^,.А-Яа-я\s]/, ''); 
         });
      });

      checkboxDeposit.addEventListener('change', this.depositHandler.bind(this));
   };  

};

const appData = new AppData();
appData.eventsListeners();











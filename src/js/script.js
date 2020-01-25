'use strict';

const form = document.querySelector('#calculator');
const tipAmount = document.querySelector('.tip-amount');
const totalAmount = document.querySelector('.total-amount');

function tipCalculator(e) {
  e.preventDefault();
  const bill = parseFloat(this.bill.value);
  const percent = parseInt(this.service.value);

  const calculatedTip = (bill / 100) * percent;
  const calculatedTotal = bill + calculatedTip;

  tipAmount.innerHTML = Math.round(calculatedTip);
  totalAmount.innerHTML = Math.round(calculatedTotal);
  this.reset();
}

form.addEventListener('submit', tipCalculator);

// src/utils/investmentCalculator.js
import { differenceInMonths, differenceInDays } from 'date-fns';

/**
 * Calcula o valor atual de um investimento com juros compostos mensais
 * @param {number} investedAmount - Valor investido
 * @param {Date|string} purchaseDate - Data da compra
 * @param {Date} currentDate - Data atual (padrão = hoje)
 * @param {number} monthlyRate - Rentabilidade mensal em % (ex: 1 para 1% ao mês)
 * @returns {number} Valor atual calculado
 */
export const calculateCurrentValue = (investedAmount, purchaseDate, currentDate = new Date(), monthlyRate = 1) => {
  const startDate = new Date(purchaseDate);
  const endDate = new Date(currentDate);
  
  // Se a data de compra for inválida ou futura
  if (isNaN(startDate.getTime()) || startDate > endDate) {
    return investedAmount;
  }
  
  // Calcular número de meses completos
  let months = differenceInMonths(endDate, startDate);
  
  // Se for menos de 1 mês, calcular dias proporcionais
  if (months < 1) {
    const days = differenceInDays(endDate, startDate);
    if (days <= 0) return investedAmount;
    // Rentabilidade diária (1% / 30 dias)
    const dailyRate = monthlyRate / 100 / 30;
    const currentValue = investedAmount * Math.pow(1 + dailyRate, days);
    return Number(currentValue.toFixed(2));
  }
  
  // Calcular com juros compostos mensais
  // Valor = Investido * (1 + taxa/100)^meses
  const rate = monthlyRate / 100;
  const currentValue = investedAmount * Math.pow(1 + rate, months);
  
  return Number(currentValue.toFixed(2));
};

/**
 * Calcula rentabilidade total (%)
 */
export const calculateTotalReturn = (investedAmount, currentValue) => {
  if (investedAmount === 0) return 0;
  return ((currentValue - investedAmount) / investedAmount) * 100;
};

/**
 * Calcula rentabilidade mensal média (%)
 */
export const calculateAverageMonthlyReturn = (investedAmount, currentValue, purchaseDate, currentDate = new Date()) => {
  const months = differenceInMonths(currentDate, new Date(purchaseDate));
  if (months <= 0) return 0;
  
  const totalReturn = (currentValue / investedAmount);
  const monthlyReturn = Math.pow(totalReturn, 1 / months) - 1;
  
  return monthlyReturn * 100;
};

/**
 * Projeta valor futuro
 */
export const projectFutureValue = (currentValue, months, monthlyRate = 1) => {
  const rate = monthlyRate / 100;
  const futureValue = currentValue * Math.pow(1 + rate, months);
  return Number(futureValue.toFixed(2));
};

/**
 * Formata valor para moeda
 */
export const formatCurrency = (value) => {
  return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

/**
 * Formata percentual
 */
export const formatPercent = (value) => {
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
};
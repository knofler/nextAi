export const getFrequencyMultiplier = (frequency) => {
  switch (frequency) {
    case 'yearly':
      return 1;
    case 'monthly':
      return 12;
    case 'weekly':
      return 52;
    case 'daily':
      return 365;
    case 'biennial':
      return 0.5;
    default:
      return 1;
  }
};

export const calculateTax = (income) => {
  if (income <= 18200) {
    return 0;
  } else if (income <= 45000) {
    return (income - 18200) * 0.16;
  } else if (income <= 135000) {
    return (45000 - 18200) * 0.16 + (income - 45000) * 0.30;
  } else if (income <= 190000) {
    return (45000 - 18200) * 0.16 + (135000 - 45000) * 0.30 + (income - 135000) * 0.37;
  } else {
    return (45000 - 18200) * 0.16 + (135000 - 45000) * 0.30 + (190000 - 135000) * 0.37 + (income - 190000) * 0.45;
  }
};

export const calculateAnnualIncome = (income, frequency) => {
  return income * getFrequencyMultiplier(frequency);
};

export const calculateAnnualExpenses = (expenses, frequency) => {
  return expenses * getFrequencyMultiplier(frequency);
};

export const calculateAnnualAvailableSavings = (totalIncome, totalTax, annualExpenses) => {
  return totalIncome - totalTax - annualExpenses;
};

export const calculateTotalAllocatedSavings = (fixedInterestSavings, fixedInterestFrequency, etfInvestment, etfFrequency, cryptoInvestment, cryptoFrequency, sharesInvestment, sharesFrequency) => {
  return (
    parseFloat(fixedInterestSavings) * getFrequencyMultiplier(fixedInterestFrequency) +
    parseFloat(etfInvestment) * getFrequencyMultiplier(etfFrequency) +
    parseFloat(cryptoInvestment) * getFrequencyMultiplier(cryptoFrequency) +
    parseFloat(sharesInvestment) * getFrequencyMultiplier(sharesFrequency)
  );
};

export const calculateProjections = (annualAvailableSavings, totalAllocatedSavings, projectionYears, compoundGrowthRate, fixedInterestSavings, fixedInterestRate, fixedInterestFrequency, etfInvestment, etfAnnualReturn, etfFrequency, etfDividendReinvestment, cryptoInvestment, cryptoGrowthRate, cryptoFrequency, sharesInvestment, sharesGrowthRate, sharesFrequency) => {
  const projection = [];
  const compoundProjection = [];
  let totalSavings = 0;
  let totalCompoundSavings = 0;

  let fixedInterestTotal = 0;
  let etfTotal = 0;
  let cryptoTotal = 0;
  let sharesTotal = 0;

  for (let i = 1; i <= projectionYears; i++) {
    totalSavings += annualAvailableSavings;
    totalCompoundSavings = (totalCompoundSavings + annualAvailableSavings) * (1 + compoundGrowthRate / 100);

    // Fixed interest savings
    const fixedInterest = fixedInterestSavings * getFrequencyMultiplier(fixedInterestFrequency) * Math.pow(1 + fixedInterestRate / 100, i);
    fixedInterestTotal += fixedInterest;

    // ETF investment
    const etfReturn = etfInvestment * getFrequencyMultiplier(etfFrequency) * Math.pow(1 + etfAnnualReturn / 100, i);
    const etfReinvestment = etfDividendReinvestment ? etfReturn : 0;
    etfTotal += etfReturn + etfReinvestment;

    // Crypto investment
    const cryptoReturn = cryptoInvestment * getFrequencyMultiplier(cryptoFrequency) * Math.pow(1 + cryptoGrowthRate / 100, i);
    cryptoTotal += cryptoReturn;

    // Shares investment
    const sharesReturn = sharesInvestment * getFrequencyMultiplier(sharesFrequency) * Math.pow(1 + sharesGrowthRate / 100, i);
    sharesTotal += sharesReturn;

    // Calculate remaining savings
    const remainingSavings = annualAvailableSavings - totalAllocatedSavings;

    // Calculate total return on investment
    const totalReturnOnInvestment = fixedInterestTotal + etfTotal + cryptoTotal + sharesTotal + (remainingSavings * i);

    projection.push({
      year: i,
      savings: totalSavings,
      investmentReturn: totalReturnOnInvestment,
    });
    compoundProjection.push({
      year: i,
      savings: totalCompoundSavings,
      investmentReturn: totalReturnOnInvestment,
    });
  }

  return { projection, compoundProjection, fixedInterestTotal, etfTotal, cryptoTotal, sharesTotal };
};
import {getNextMonth, getDaysCountInYear, getDaysCountBetweenDates, formatDate} from './date';
import { roundValue } from "./common";

const MAX_MONTHS_COUNT = 360;
const startDate = new Date();

function addFormattedFields(row) {
    row['dateFormatted'] = formatDate(row.date);
    row['paymentRounded'] = roundValue(row.payment);
    row['paymentByPercentsRounded'] = roundValue(row.paymentByPercents);
    row['paymentByCreditRounded'] = roundValue(row.paymentByCredit);
    row['overpaymentRounded'] = roundValue(row.overpayment);
    row['creditLeftRounded'] = roundValue(row.creditLeft);
}

function calculateOnePayment(previousRow, payment, percentage) {
    const currentRow = {
        number: previousRow.number + 1,
        date: getNextMonth(previousRow.date),
        payment,
    };

    const daysCountInPreviousYear = getDaysCountInYear(previousRow.date.getFullYear());
    const daysCountInCurrentYear = getDaysCountInYear(currentRow.date.getFullYear());
    let paymentByPercents = 0;
    // Случай, когда платежный месяц выпадает на границу високосного и невисокоснова годов
    // В таком случае стоимость одного дня для платежного месяца рассчитывается по разному
    if (
        previousRow.date.getMonth() === 11 &&
        daysCountInPreviousYear !== daysCountInCurrentYear
    ) {
        const daysCountInPreviousMonth = getDaysCountBetweenDates(
            previousRow.date, new Date(`${previousRow.date.getFullYear()}-12-31`)
        );
        const daysCountInCurrentMonth = getDaysCountBetweenDates(
            new Date(`${currentRow.date.getFullYear()}-01-01`), currentRow.date,
        ) + 1;

        const oneDayCreditCostForPreviousMonth = previousRow.creditLeft * percentage / daysCountInPreviousYear;
        const oneDayCreditCostForCurrentMonth = previousRow.creditLeft * percentage / daysCountInCurrentYear;

        paymentByPercents = oneDayCreditCostForPreviousMonth * daysCountInPreviousMonth + oneDayCreditCostForCurrentMonth * daysCountInCurrentMonth
    } else {
        // обычный случай
        const oneDayCreditCost = previousRow.creditLeft * percentage / daysCountInPreviousYear;
        paymentByPercents = oneDayCreditCost * getDaysCountBetweenDates(previousRow.date, currentRow.date);
    }

    // последний платежный месяц
    if (previousRow.creditLeft <= payment) {
        currentRow.payment = previousRow.creditLeft + paymentByPercents;
    }

    const paymentByCredit = currentRow.payment - paymentByPercents;

    currentRow['paymentByPercents'] = paymentByPercents;
    currentRow['paymentByCredit'] = paymentByCredit;
    currentRow['overpayment'] = previousRow.overpayment + paymentByPercents;
    currentRow['creditLeft'] = previousRow.creditLeft - paymentByCredit;

    addFormattedFields(currentRow);

    return currentRow;
}

export default function calculatePayments({creditSum, creditPercent, paymentPerMonth}) {
    const paymentSchedule = [];
    const percentage = creditPercent / 100;

    paymentSchedule[0] = {
        number: 0,
        date: startDate,
        payment: 0,
        paymentByPercents: 0,
        paymentByCredit: 0,
        overpayment: 0,
        creditLeft: creditSum,
    };

    addFormattedFields(paymentSchedule[0]);

    let creditLeft = creditSum;
    let monthCount = 0;

    while (paymentSchedule.length < MAX_MONTHS_COUNT && creditLeft > 0) {
        const nextPayment = calculateOnePayment(paymentSchedule[monthCount], paymentPerMonth, percentage);
        paymentSchedule.push(nextPayment);
        creditLeft = nextPayment.creditLeft;
        monthCount++;
    }

    const lastRow = paymentSchedule[paymentSchedule.length - 1];

    return {
        dataByMonths: paymentSchedule,
        summary: {
            overpayment: lastRow.overpayment,
            overpaymentPercent: Math.round(lastRow.overpayment / creditSum * 100),
            monthCount: paymentSchedule.length,
            lastPaymentDate: lastRow.date,
        }
    };
}

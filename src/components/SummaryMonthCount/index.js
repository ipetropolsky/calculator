import React from 'react';
import { useSelector } from 'react-redux';
import MuiEventAvailableIcon from '@material-ui/icons/EventAvailable';

import Summary from 'src/components/common/Summary';
import { formatDate } from 'src/utils/date';

export default function SummaryMonthCount() {
    const {
        paymentSchedule: { summary },
    } = useSelector((state) => state);
    return (
        <Summary
            title="Срок кредита"
            icon={<MuiEventAvailableIcon />}
            value={summary.monthCount}
            units="мес."
            footer={`Последний платеж – ${formatDate(summary.lastPaymentDate)}`}
            iconType="success"
        />
    );
}

import React from 'react';
import { useSelector } from 'react-redux';
import MuiAttachMoneyIcon from '@material-ui/icons/AttachMoney';

import Summary from 'src/components/common/Summary';
import { priceFormat } from 'src/utils/common';

export default function SummaryOverpayment() {
    const {
        paymentSchedule: { summary },
    } = useSelector((state) => state);
    return (
        <Summary
            title="Переплата"
            icon={<MuiAttachMoneyIcon />}
            value={`${priceFormat(summary.overpayment)}`}
            units="руб."
            footer={`Это ${summary.overpaymentPercent}% от суммы кредита`}
            iconType="warning"
        />
    );
}

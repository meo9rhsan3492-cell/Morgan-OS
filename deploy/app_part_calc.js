// ----------------------------------------
// 15. Export Price Calculator (5-Layer)
// ----------------------------------------
function runCalc() {
    // 1. Get Inputs
    const rate = parseFloat(document.getElementById('calc-rate').value) || 7.0;
    const rebate = parseFloat(document.getElementById('calc-rebate').value) || 0;
    const factoryPrice = parseFloat(document.getElementById('calc-factory-price').value) || 0; // RMB
    const qty = parseFloat(document.getElementById('calc-qty').value) || 1;
    // const cbm = parseFloat(document.getElementById('calc-cbm').value) || 0; // Not used in pricing directly but useful for tiers

    // Layer 2: Logistics (Total RMB)
    const inland = parseFloat(document.getElementById('calc-inland').value) || 0;
    const port = parseFloat(document.getElementById('calc-port').value) || 0;

    // Layer 3: Shipping (Total USD)
    const seaFreight = parseFloat(document.getElementById('calc-sea').value) || 0;

    // Layer 4 & 5: Finance
    // Sync slider and input
    const marginSlider = document.getElementById('calc-margin-slider');
    const marginInput = document.getElementById('calc-margin');
    if (document.activeElement === marginSlider) marginInput.value = marginSlider.value;
    else if (document.activeElement === marginInput) marginSlider.value = marginInput.value;

    const marginPercent = parseFloat(marginInput.value) / 100;
    const commPercent = (parseFloat(document.getElementById('calc-comm').value) || 0) / 100;

    // --- Calculation Logic ---

    // Step A: Real Cost (Factory Price - Tax Refund Benefit)
    // Formula: RealCost = Price - (Price / 1.13 * RebateRate)
    // Assumption: Factory Price includes 13% VAT.
    const vatRate = 1.13;
    const rebateAmtPerUnit = (factoryPrice / vatRate) * (rebate / 100);
    const realCostRMB = factoryPrice - rebateAmtPerUnit;

    document.getElementById('calc-real-cost').innerText = '¥' + realCostRMB.toFixed(2);

    // Step B: FOB Cost in USD (Includes Logistics)
    const totalLocalRMB = inland + port;
    const localCostPerUnitRMB = totalLocalRMB / qty;
    const totalCostRMB = realCostRMB + localCostPerUnitRMB;

    // Convert to USD Cost
    const costUSD = totalCostRMB / rate;

    // Step C: CIF Cost (Add Sea Freight)
    const seaFreightPerUnit = seaFreight / qty;
    const finalCostUSD = costUSD + seaFreightPerUnit;

    // Step D: Target Price (Cost / (1 - Margin - Comm))
    // We use Divisor formula to preserve true margin.
    // Price = Cost / (1 - 0.2) = Cost / 0.8
    const divisor = 1 - marginPercent - commPercent;
    let finalPrice = 0;
    if (divisor > 0) {
        finalPrice = finalCostUSD / divisor;
    }

    // Step E: Profit
    const profitPerUnit = finalPrice - finalCostUSD;
    const totalProfit = profitPerUnit * qty;

    // Update UI
    document.getElementById('calc-final-price').innerText = finalPrice.toFixed(2);
    document.getElementById('calc-profit-unit').innerText = '$' + profitPerUnit.toFixed(2);
    document.getElementById('calc-profit-total').innerText = '$' + totalProfit.toFixed(0);

    // Update Tiers
    updateTiers(factoryPrice, realCostRMB, inland, port, seaFreight, rate, marginPercent, commPercent, qty);

    // Also trigger reverse check if input exists
    if (document.getElementById('calc-target-price').value) runReverseCalc();
}

function updateTiers(factoryPrice, realCostRMB, inland, port, seaFreight, rate, marginPercent, commPercent, baseQty) {
    const tbody = document.getElementById('calc-tier-body');
    const qtys = [baseQty, baseQty * 2, baseQty * 5];

    tbody.innerHTML = qtys.map(q => {
        // Recalc Logistics Dilution
        const localCostPerUnitRMB = (inland + port) / q; // Assumption: Inland/Port fixed for batch? Or partially variable. Simplified as Fixed Batch here.
        const totalCostRMB = realCostRMB + localCostPerUnitRMB;
        const costUSD = totalCostRMB / rate;
        const seaPerUnit = seaFreight / q; // Assumption: Sea Freight fixed per batch (Container)?
        const finalCost = costUSD + seaPerUnit;

        const divisor = 1 - marginPercent - commPercent;
        const price = divisor > 0 ? finalCost / divisor : 0;

        // Highlight logic
        const highlight = q === baseQty ? 'text-blue-400 font-bold' : '';

        return `
        <tr class="border-b border-gray-800 ${highlight}">
            <td class="py-2">${q}</td>
            <td class="py-2">$${(localCostPerUnitRMB / rate + seaPerUnit).toFixed(2)}</td>
            <td class="py-2 text-right">$${price.toFixed(2)}</td>
        </tr>
        `;
    }).join('');
}

function runReverseCalc() {
    const targetPrice = parseFloat(document.getElementById('calc-target-price').value) || 0;
    const quotedPrice = parseFloat(document.getElementById('calc-final-price').innerText) || 0;
    const profitUnit = parseFloat(document.getElementById('calc-profit-unit').innerText.replace('$', '')) || 0;

    // Implied Margin = (Target - Cost) / Target
    // Cost = QuotedPrice - ProfitUnit
    const cost = quotedPrice - profitUnit;

    if (targetPrice > 0) {
        const impliedProfit = targetPrice - cost;
        const impliedMargin = (impliedProfit / targetPrice) * 100;

        const el = document.getElementById('calc-reverse-margin');
        el.innerText = impliedMargin.toFixed(1) + '%';

        if (impliedMargin < 0) el.className = "text-2xl font-bold font-mono text-red-500";
        else if (impliedMargin < 10) el.className = "text-2xl font-bold font-mono text-yellow-500";
        else el.className = "text-2xl font-bold font-mono text-green-500";
    }
}

// ----------------------------------------
// Phase 16: Quote PDF Export
// ----------------------------------------
function generateQuotePDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Get current quote data
    const companyName = localStorage.getItem('tds_company_name') || 'Your Company Name';
    const companyAddress = localStorage.getItem('tds_company_address') || 'Your Address';
    const companyContact = localStorage.getItem('tds_company_contact') || 'contact@company.com';

    const quoteNumber = 'Q-' + Date.now().toString().slice(-8);
    const quoteDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    // Get calculator values
    const qty = document.getElementById('calc-qty').value || '0';
    const factoryPrice = document.getElementById('calc-factory-price').value || '0';
    const finalPrice = document.getElementById('calc-final-price').innerText || '0.00';
    const profitUnit = document.getElementById('calc-profit-unit').innerText || '$0.00';
    const exchangeRate = document.getElementById('calc-rate').value || '7.20';

    // Calculate totals
    const unitPrice = parseFloat(finalPrice);
    const quantity = parseInt(qty);
    const totalAmount = (unitPrice * quantity).toFixed(2);

    // === PDF Layout ===

    // Header - Company Info
    doc.setFillColor(59, 130, 246);
    doc.rect(0, 0, 210, 35, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('QUOTATION', 105, 18, { align: 'center' });

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(companyName, 105, 28, { align: 'center' });

    // Quote Details
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.text(`Quote No: ${quoteNumber}`, 20, 50);
    doc.text(`Date: ${quoteDate}`, 20, 57);
    doc.text(`Valid Until: 30 days from quote date`, 20, 64);

    // Company Info (Right Side)
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text(companyAddress, 190, 50, { align: 'right' });
    doc.text(companyContact, 190, 57, { align: 'right' });

    // Divider
    doc.setDrawColor(200, 200, 200);
    doc.line(20, 75, 190, 75);

    // Customer Info Section
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Bill To:', 20, 85);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text('[Customer Name]', 20, 93);
    doc.text('[Customer Company]', 20, 100);
    doc.text('[Customer Email]', 20, 107);

    // Items Table Header
    const tableTop = 125;
    doc.setFillColor(240, 240, 240);
    doc.rect(20, tableTop, 170, 10, 'F');

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Description', 25, tableTop + 7);
    doc.text('Qty', 100, tableTop + 7);
    doc.text('Unit Price', 125, tableTop + 7);
    doc.text('Total', 165, tableTop + 7);

    // Items Row
    doc.setFont('helvetica', 'normal');
    const rowY = tableTop + 20;
    doc.text('[Product Name]', 25, rowY);
    doc.text(qty, 100, rowY);
    doc.text(`$${finalPrice}`, 125, rowY);
    doc.text(`$${totalAmount}`, 165, rowY);

    // Subtotal Section
    doc.line(20, rowY + 10, 190, rowY + 10);

    doc.setFont('helvetica', 'normal');
    doc.text('Subtotal:', 140, rowY + 20);
    doc.text(`$${totalAmount}`, 175, rowY + 20, { align: 'right' });

    doc.text('Shipping:', 140, rowY + 28);
    doc.text('TBD', 175, rowY + 28, { align: 'right' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('Total:', 140, rowY + 40);
    doc.text(`$${totalAmount}`, 175, rowY + 40, { align: 'right' });

    // Terms Section
    const termsY = rowY + 60;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Terms & Conditions:', 20, termsY);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);
    doc.text('• Payment: T/T 30% deposit, 70% before shipment', 25, termsY + 10);
    doc.text('• Delivery: 30-45 days after deposit received', 25, termsY + 18);
    doc.text(`• Exchange Rate: 1 USD = ${exchangeRate} CNY (for reference)`, 25, termsY + 26);
    doc.text('• FOB Price / CIF Price on request', 25, termsY + 34);

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('Generated by TDS Marketing OS', 105, 280, { align: 'center' });

    // Save
    doc.save(`Quote_${quoteNumber}.pdf`);

    if (typeof showToast === 'function') {
        showToast('📄 报价单PDF已生成并下载', 'success');
    }
}

function copyQuoteToClipboard() {
    const qty = document.getElementById('calc-qty').value || '0';
    const finalPrice = document.getElementById('calc-final-price').innerText || '0.00';
    const exchangeRate = document.getElementById('calc-rate').value || '7.20';
    const margin = document.getElementById('calc-margin').value || '0';

    const quantity = parseInt(qty);
    const unitPrice = parseFloat(finalPrice);
    const totalAmount = (unitPrice * quantity).toFixed(2);

    const quoteText = `
📋 QUOTATION SUMMARY
========================
Quantity: ${qty} units
Unit Price: $${finalPrice} USD
Total Amount: $${totalAmount} USD

Terms:
• Payment: T/T 30% deposit
• Delivery: 30-45 days
• Exchange Rate: ${exchangeRate}
• Margin: ${margin}%
========================
    `.trim();

    navigator.clipboard.writeText(quoteText).then(() => {
        if (typeof showToast === 'function') {
            showToast('📋 报价信息已复制到剪贴板', 'success');
        }
    });
}

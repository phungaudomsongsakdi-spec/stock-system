const ReportComponent = {
  render() {
    return `
      <div class="card">
        <div class="card-header">
          <h2><i class="fas fa-chart-line"></i> สรุปรายเดือน</h2>
          <div><input type="month" id="monthReportPicker" value="2025-02"></div>
        </div>
        <div class="card-body">
          <div class="table-wrapper">
            <table>
              <thead><tr><th>ประเภทการเคลื่อนไหว</th><th>จำนวนหน่วย</th><th>มูลค่ารวม (บาท)</th></tr></thead>
              <tbody id="summaryTbody"></tbody>
            </table>
          </div>
          <div style="margin-top:24px; background:#f0f9ff; border-radius:24px; padding:16px;">
            <h4>📊 สรุปภาพรวมเดือนนี้</h4>
            <p><strong>💰 ยอดรวมมูลค่าที่แจก:</strong> <span id="totalMonthValue">0</span> บาท</p>
            <p><strong>📦 จำนวนหน่วยที่แจก:</strong> <span id="totalMonthUnits">0</span> ชิ้น</p>
            <p><strong>↩️ ยอดรวมมูลค่าที่คืน:</strong> <span id="totalReturnValue">0</span> บาท</p>
            <p><strong>📊 สุทธิ:</strong> <span id="netMonthValue">0</span> บาท</p>
          </div>
          <button id="exportMonthCSV" class="btn" style="margin-top:20px;"><i class="fas fa-download"></i> ส่งออกรายงาน CSV</button>
        </div>
      </div>
    `;
  },
  
  renderMonthlyReport() {
    const month = document.getElementById("monthReportPicker").value;
    if (!month) return;
    const [year, monthNum] = month.split("-");
    
    const filteredMovements = AppStorage.movements.filter(m => m.date.startsWith(`${year}-${monthNum}`));
    const filteredReturns = AppStorage.returns.filter(r => r.date.startsWith(`${year}-${monthNum}`));
    
    const summary = { anniversary: { qty: 0, val: 0 }, probation: { qty: 0, val: 0 }, general: { qty: 0, val: 0 }, newhire: { qty: 0, val: 0 } };
    filteredMovements.forEach(m => { if (summary[m.type]) { summary[m.type].qty += m.quantity; summary[m.type].val += m.totalValue; } });
    
    const totalReturnValue = filteredReturns.reduce((sum, r) => sum + (r.valueWhenIssued || 0), 0);
    const totalVal = Object.values(summary).reduce((s, v) => s + v.val, 0);
    const totalUnits = Object.values(summary).reduce((s, v) => s + v.qty, 0);
    
    const tbody = document.getElementById("summaryTbody");
    if (tbody) {
      tbody.innerHTML = `
        <tr><td>🎉 ชุดครบปี</td><td>${summary.anniversary.qty}</td><td>${summary.anniversary.val.toFixed(2)}</td></tr>
        <tr><td>📋 ชุดทดลองงาน</td><td>${summary.probation.qty}</td><td>${summary.probation.val.toFixed(2)}</td></tr>
        <tr><td>👥 เบิกจ่ายทั่วไป</td><td>${summary.general.qty}</td><td>${summary.general.val.toFixed(2)}</td></tr>
        <tr><td>🆕 พนักงานใหม่</td><td>${summary.newhire.qty}</td><td>${summary.newhire.val.toFixed(2)}</td></tr>
      `;
    }
    
    document.getElementById("totalMonthValue").innerText = totalVal.toFixed(2);
    document.getElementById("totalMonthUnits").innerText = totalUnits;
    document.getElementById("totalReturnValue").innerText = totalReturnValue.toFixed(2);
    document.getElementById("netMonthValue").innerText = (totalVal - totalReturnValue).toFixed(2);
  },
  
  exportMonthCSV() {
    const month = document.getElementById("monthReportPicker").value;
    const [year, monthNum] = month.split("-");
    const filteredMovements = AppStorage.movements.filter(m => m.date.startsWith(`${year}-${monthNum}`));
    
    let csv = [["รายงานเดือน", month], [], ["วันที่", "ประเภท", "Itemcode", "สินค้า", "จำนวน", "มูลค่า", "แผนก", "หมายเหตุ"]];
    filteredMovements.forEach(m => {
      csv.push([m.date, m.typeLabel, m.itemcode, m.description, m.quantity, (m.totalValue || 0).toFixed(2), m.department || "-", m.note || "-"]);
    });
    
    const content = csv.map(row => row.join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + content], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `report_${month}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  }
};

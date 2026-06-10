const MovementComponent = {
  selectedProduct: null,
  selectedDepartment: "",
  departments: ["PA", "SCM", "DC", "AC", "PC", "GA", "HR", "TM", "PS", "RC", "OVEN", "QC", "SS", "RK", "ND"],
  
  render() {
    return `
      <div class="card">
        <div class="card-header"><h2><i class="fas fa-people-arrows"></i> บันทึกการเบิกจ่าย</h2></div>
        <div class="card-body">
          <div style="background:#f8fafc; border-radius:24px; padding:20px; margin-bottom:24px;">
            <div class="form-row">
              <div class="form-group" style="flex:2; position:relative;">
                <label>🔍 เลือกสินค้า</label>
                <input type="text" id="movementProductInput" placeholder="พิมพ์ Itemcode หรือชื่อสินค้า..." autocomplete="off">
                <div id="movementDropdownList" style="display:none; position:absolute; background:white; border:1px solid #ccc; border-radius:16px; max-height:250px; overflow:auto; z-index:100;"></div>
              </div>
              <div class="form-group"><label>จำนวน</label><input type="number" id="movementQty" min="1" value="1"></div>
              <div class="form-group"><label>ประเภท</label>
                <select id="movementType">
                  <option value="anniversary">🎉 ชุดครบปี</option>
                  <option value="probation">📋 ชุดผ่านทดลองงาน</option>
                  <option value="general">👥 เบิกจ่ายทั่วไป</option>
                  <option value="newhire">🆕 พนักงานใหม่</option>
                </select>
              </div>
              <div class="form-group"><label>วันที่</label><input type="date" id="movementDate"></div>
            </div>
            <div class="form-row">
              <div class="form-group"><label>ผู้จ่าย</label><input type="text" id="movementIssuer" placeholder="ชื่อผู้จ่าย"></div>
              <div class="form-group" style="position:relative;">
                <label>🔍 แผนก</label>
                <input type="text" id="movementDeptInput" placeholder="พิมพ์ชื่อแผนก..." autocomplete="off">
                <div id="movementDeptDropdownList" style="display:none; position:absolute; background:white; border:1px solid #ccc; border-radius:16px; max-height:200px; overflow:auto; z-index:100;"></div>
              </div>
              <div class="form-group"><label>ส่วนงาน</label><input type="text" id="movementNote" placeholder="ส่วนงานที่เบิก"></div>
              <div class="form-group"><button id="recordMovementBtn" class="btn btn-primary">บันทึก</button></div>
            </div>
            <div id="selectedProductDisplay" style="display:none; margin-top:12px; background:#eef2ff; padding:8px 16px; border-radius:20px;">✅ <span id="selectedProductName"></span></div>
          </div>
          
          <div class="filter-bar">
            <input type="text" id="historySearch" placeholder="🔍 ค้นหา...">
            <select id="historyTypeFilter"><option value="">ทุกประเภท</option><option value="anniversary">🎉 ชุดครบปี</option><option value="probation">📋 ชุดทดลองงาน</option><option value="general">👥 ทั่วไป</option><option value="newhire">🆕 พนักงานใหม่</option></select>
            <input type="text" id="historyDeptInput" placeholder="แผนก">
            <input type="date" id="historyDateFrom">
            <input type="date" id="historyDateTo">
            <button id="resetHistoryBtn" class="btn btn-sm">รีเซ็ต</button>
            <button id="exportHistoryExcelBtn" class="btn btn-sm" style="background:#10b981; color:white;">📎 ส่งออก Excel</button>
          </div>
          
          <div class="table-wrapper">
            <table style="min-width:1000px">
              <thead><tr><th>วันที่</th><th>ประเภท</th><th>Itemcode</th><th>สินค้า</th><th>จำนวน</th><th>มูลค่า</th><th>ผู้จ่าย</th><th>แผนก</th><th>หมายเหตุ</th></tr></thead>
              <tbody id="historyTbody"></tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  },
  
  formatDateToThai(dateStr) {
    if (!dateStr) return "-";
    const parts = dateStr.split('-');
    if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parseInt(parts[0]) + 543}`;
    return dateStr;
  },
  
  updateDropdownList(searchText) {
    const products = AppStorage.products;
    const dropdown = document.getElementById("movementDropdownList");
    if (!dropdown) return;
    if (!searchText.trim()) { dropdown.style.display = "none"; return; }
    
    const filtered = products.filter(p => p.itemcode.toLowerCase().includes(searchText.toLowerCase()) || p.description.toLowerCase().includes(searchText.toLowerCase()));
    if (filtered.length === 0) {
      dropdown.innerHTML = '<div style="padding:12px; text-align:center;">ไม่พบสินค้า</div>';
      dropdown.style.display = "block";
      return;
    }
    
    let html = "";
    filtered.slice(0, 15).forEach(p => {
      html += `<div class="dropdown-item" data-code="${p.itemcode}" data-name="${p.description}" data-price="${p.price}" data-stock="${p.quantity}" style="padding:10px; cursor:pointer; border-bottom:1px solid #eee;">📦 <strong>${p.itemcode}</strong> - ${p.description.substring(0,40)} <span style="float:right;">เหลือ ${p.quantity}</span></div>`;
    });
    dropdown.innerHTML = html;
    dropdown.style.display = "block";
    
    document.querySelectorAll(".dropdown-item").forEach(item => {
      item.addEventListener("click", () => {
        this.selectedProduct = {
          itemcode: item.dataset.code,
          description: item.dataset.name,
          price: parseFloat(item.dataset.price),
          quantity: parseInt(item.dataset.stock)
        };
        document.getElementById("movementProductInput").value = `${this.selectedProduct.itemcode} - ${this.selectedProduct.description.substring(0,50)}`;
        document.getElementById("selectedProductDisplay").style.display = "block";
        document.getElementById("selectedProductName").innerHTML = `${this.selectedProduct.itemcode} - ${this.selectedProduct.description}`;
        dropdown.style.display = "none";
      });
    });
  },
  
  updateDeptDropdownList(searchText) {
    const dropdown = document.getElementById("movementDeptDropdownList");
    if (!dropdown) return;
    if (!searchText.trim()) { dropdown.style.display = "none"; return; }
    
    const filtered = this.departments.filter(d => d.toLowerCase().includes(searchText.toLowerCase()));
    if (filtered.length === 0) { dropdown.style.display = "none"; return; }
    
    let html = "";
    filtered.forEach(d => {
      html += `<div class="dept-item" data-dept="${d}" style="padding:10px; cursor:pointer; border-bottom:1px solid #eee;">🏢 ${d}</div>`;
    });
    dropdown.innerHTML = html;
    dropdown.style.display = "block";
    
    document.querySelectorAll(".dept-item").forEach(item => {
      item.addEventListener("click", () => {
        this.selectedDepartment = item.dataset.dept;
        document.getElementById("movementDeptInput").value = this.selectedDepartment;
        dropdown.style.display = "none";
      });
    });
  },
  
  async recordMovement() {
    if (!this.selectedProduct) { alert("กรุณาเลือกสินค้า"); return; }
    if (!this.selectedDepartment) { alert("กรุณาเลือกแผนก"); return; }
    
    const qty = parseInt(document.getElementById("movementQty").value);
    if (isNaN(qty) || qty <= 0) { alert("จำนวนต้องมากกว่า 0"); return; }
    if (this.selectedProduct.quantity < qty) { alert(`สต๊อกไม่พอ! เหลือ ${this.selectedProduct.quantity}`); return; }
    
    const type = document.getElementById("movementType").value;
    const date = document.getElementById("movementDate").value || Helpers.formatDate();
    const issuer = document.getElementById("movementIssuer").value.trim() || "-";
    const note = document.getElementById("movementNote").value.trim() || "-";
    
    const typeLabels = { anniversary: "🎉 ชุดครบปี", probation: "📋 ชุดทดลองงาน", general: "👥 เบิกจ่ายทั่วไป", newhire: "🆕 พนักงานใหม่" };
    
    const movement = {
      date, type, typeLabel: typeLabels[type],
      itemcode: this.selectedProduct.itemcode,
      description: this.selectedProduct.description,
      quantity: qty,
      unitPrice: this.selectedProduct.price,
      totalValue: this.selectedProduct.price * qty,
      issuer, department: this.selectedDepartment, note,
      timestamp: Helpers.getCurrentTimestamp()
    };
    
    const result = await API.saveMovement(movement);
    if (result && result.success) {
      const product = AppStorage.products.find(p => p.itemcode === this.selectedProduct.itemcode);
      if (product) product.quantity -= qty;
      AppStorage.movements.push(movement);
      AppStorage.saveLocalBackup();
      
      this.renderMovementsHistory();
      StockComponent.renderStockTable();
      Helpers.updateStats();
      
      document.getElementById("movementQty").value = "1";
      document.getElementById("movementIssuer").value = "";
      document.getElementById("movementNote").value = "";
      document.getElementById("movementProductInput").value = "";
      document.getElementById("movementDeptInput").value = "";
      document.getElementById("selectedProductDisplay").style.display = "none";
      this.selectedProduct = null;
      this.selectedDepartment = "";
      
      alert("✅ บันทึกสำเร็จ!");
    } else {
      alert("❌ บันทึกไม่สำเร็จ");
    }
  },
  
  renderMovementsHistory(filterText = "", typeFilter = "", deptFilter = "", fromDate = "", toDate = "") {
    let filtered = [...AppStorage.movements];
    if (filterText) filtered = filtered.filter(m => m.itemcode.includes(filterText) || m.description.includes(filterText));
    if (typeFilter) filtered = filtered.filter(m => m.type === typeFilter);
    if (deptFilter) filtered = filtered.filter(m => (m.department || "").includes(deptFilter));
    if (fromDate) filtered = filtered.filter(m => m.date >= fromDate);
    if (toDate) filtered = filtered.filter(m => m.date <= toDate);
    filtered.sort((a, b) => b.date.localeCompare(a.date));
    
    const tbody = document.getElementById("historyTbody");
    if (!tbody) return;
    if (filtered.length === 0) { tbody.innerHTML = "<tr><td colspan='9'>ไม่มีประวัติ</td></tr>"; return; }
    
    let html = "";
    filtered.forEach(m => {
      html += `<tr>
        <td>${this.formatDateToThai(m.date)}</td>
        <td>${m.typeLabel || m.type}</td>
        <td>${m.itemcode}</td>
        <td>${m.description}</td>
        <td>${m.quantity}</td>
        <td>${(m.totalValue || 0).toFixed(2)}</td>
        <td>${m.issuer || "-"}</td>
        <td>${m.department || "-"}</td>
        <td>${m.note || "-"}</td>
      </tr>`;
    });
    tbody.innerHTML = html;
  },
  
  exportToExcel() {
    alert("ฟังก์ชันส่งออก Excel กำลังพัฒนา");
  }
};

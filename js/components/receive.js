const ReceiveComponent = {
  selectedProduct: null,
  
  render() {
    return `
      <div class="card">
        <div class="card-header"><h2><i class="fas fa-truck-loading"></i> รับสินค้าเข้า</h2></div>
        <div class="card-body">
          <div style="background:#e0f2fe; border-radius:24px; padding:20px; margin-bottom:24px;">
            <div class="form-row">
              <div class="form-group" style="flex:2; position:relative;">
                <label>🔍 เลือกสินค้า</label>
                <input type="text" id="receiveProductInput" placeholder="พิมพ์ Itemcode หรือชื่อสินค้า..." autocomplete="off">
                <div id="receiveDropdownList" style="display:none; position:absolute; background:white; border:1px solid #ccc; border-radius:16px; max-height:250px; overflow:auto; z-index:100;"></div>
              </div>
              <div class="form-group"><label>จำนวน</label><input type="number" id="receiveQty" min="1" value="1"></div>
              <div class="form-group"><label>วันที่</label><input type="date" id="receiveDate"></div>
            </div>
            <div class="form-row">
              <div class="form-group"><label>ผู้จัดส่ง</label><input type="text" id="receiveSupplier" placeholder="ชื่อผู้จัดส่ง"></div>
              <div class="form-group"><label>ผู้รับ</label><input type="text" id="receiveReceiver" placeholder="ชื่อผู้รับ"></div>
              <div class="form-group"><label>หมายเหตุ</label><input type="text" id="receiveNote" placeholder="หมายเหตุ"></div>
              <div class="form-group"><button id="recordReceiveBtn" class="btn btn-primary">บันทึก</button></div>
            </div>
            <div id="selectedReceiveProductDisplay" style="display:none; margin-top:12px; background:#e0f2fe; padding:8px 16px; border-radius:20px;">✅ <span id="selectedReceiveProductName"></span></div>
          </div>
          
          <div class="filter-bar">
            <input type="text" id="receiveHistorySearch" placeholder="🔍 ค้นหา...">
            <button id="resetReceiveHistoryBtn" class="btn btn-sm">รีเซ็ต</button>
            <button id="exportReceiveHistoryExcelBtn" class="btn btn-sm" style="background:#10b981; color:white;">📎 ส่งออก Excel</button>
          </div>
          
          <div class="table-wrapper">
            <table style="min-width:800px">
              <thead><tr><th>วันที่</th><th>Itemcode</th><th>สินค้า</th><th>จำนวน</th><th>มูลค่า</th><th>ผู้จัดส่ง</th><th>ผู้รับ</th><th>หมายเหตุ</th></tr></thead>
              <tbody id="receiveHistoryTbody"></tbody>
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
  
  updateReceiveDropdownList(searchText) {
    const products = AppStorage.products;
    const dropdown = document.getElementById("receiveDropdownList");
    if (!dropdown) return;
    if (!searchText.trim()) { dropdown.style.display = "none"; return; }
    
    const filtered = products.filter(p => p.itemcode.toLowerCase().includes(searchText.toLowerCase()) || p.description.toLowerCase().includes(searchText.toLowerCase()));
    if (filtered.length === 0) { dropdown.style.display = "none"; return; }
    
    let html = "";
    filtered.slice(0, 15).forEach(p => {
      html += `<div class="receive-item" data-code="${p.itemcode}" data-name="${p.description}" data-price="${p.price}" style="padding:10px; cursor:pointer; border-bottom:1px solid #eee;">📦 ${p.itemcode} - ${p.description.substring(0,40)}</div>`;
    });
    dropdown.innerHTML = html;
    dropdown.style.display = "block";
    
    document.querySelectorAll(".receive-item").forEach(item => {
      item.addEventListener("click", () => {
        this.selectedProduct = {
          itemcode: item.dataset.code,
          description: item.dataset.name,
          price: parseFloat(item.dataset.price)
        };
        document.getElementById("receiveProductInput").value = `${this.selectedProduct.itemcode} - ${this.selectedProduct.description.substring(0,50)}`;
        document.getElementById("selectedReceiveProductDisplay").style.display = "block";
        document.getElementById("selectedReceiveProductName").innerHTML = `${this.selectedProduct.itemcode} - ${this.selectedProduct.description}`;
        dropdown.style.display = "none";
      });
    });
  },
  
  async recordReceive() {
    if (!this.selectedProduct) { alert("กรุณาเลือกสินค้า"); return; }
    
    const qty = parseInt(document.getElementById("receiveQty").value);
    if (isNaN(qty) || qty <= 0) { alert("จำนวนต้องมากกว่า 0"); return; }
    
    const supplier = document.getElementById("receiveSupplier").value.trim();
    const receiver = document.getElementById("receiveReceiver").value.trim();
    const date = document.getElementById("receiveDate").value || Helpers.formatDate();
    const note = document.getElementById("receiveNote").value.trim() || "-";
    
    if (!supplier) { alert("กรุณากรอกผู้จัดส่ง"); return; }
    if (!receiver) { alert("กรุณากรอกผู้รับ"); return; }
    
    const receive = {
      date, itemcode: this.selectedProduct.itemcode,
      description: this.selectedProduct.description,
      quantity: qty, unitPrice: this.selectedProduct.price,
      totalValue: this.selectedProduct.price * qty,
      supplier, receiver, note,
      timestamp: Helpers.getCurrentTimestamp()
    };
    
    const result = await API.saveReceive(receive);
    if (result && result.success) {
      const product = AppStorage.products.find(p => p.itemcode === this.selectedProduct.itemcode);
      if (product) product.quantity += qty;
      AppStorage.receives.push(receive);
      AppStorage.saveLocalBackup();
      
      this.renderReceiveHistory();
      StockComponent.renderStockTable();
      Helpers.updateStats();
      
      document.getElementById("receiveProductInput").value = "";
      document.getElementById("receiveQty").value = "1";
      document.getElementById("receiveSupplier").value = "";
      document.getElementById("receiveReceiver").value = "";
      document.getElementById("receiveNote").value = "";
      document.getElementById("selectedReceiveProductDisplay").style.display = "none";
      this.selectedProduct = null;
      
      alert("✅ รับสินค้าเข้าสำเร็จ!");
    } else {
      alert("❌ บันทึกไม่สำเร็จ");
    }
  },
  
  renderReceiveHistory(filterText = "") {
    let filtered = [...AppStorage.receives];
    if (filterText) filtered = filtered.filter(r => r.itemcode.includes(filterText) || r.description.includes(filterText) || r.supplier.includes(filterText));
    filtered.sort((a, b) => b.date.localeCompare(a.date));
    
    const tbody = document.getElementById("receiveHistoryTbody");
    if (!tbody) return;
    if (filtered.length === 0) { tbody.innerHTML = "<tr><td colspan='8'>ไม่มีประวัติ</td></tr>"; return; }
    
    let html = "";
    filtered.forEach(r => {
      html += `<tr>
        <td>${this.formatDateToThai(r.date)}</td>
        <td>${r.itemcode}</td>
        <td>${r.description}</td>
        <td>${r.quantity}</td>
        <td>${(r.totalValue || 0).toFixed(2)}</td>
        <td>${r.supplier || "-"}</td>
        <td>${r.receiver || "-"}</td>
        <td>${r.note || "-"}</td>
      </tr>`;
    });
    tbody.innerHTML = html;
  }
};

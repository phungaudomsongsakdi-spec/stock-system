const ReturnComponent = {
  selectedProduct: null,
  selectedDepartment: "",
  departments: ["PA", "SCM", "DC", "AC", "PC", "GA", "HR", "TM", "PS", "RC", "OVEN", "QC", "SS", "RK", "ND"],
  
  render() {
    return `
      <div class="card">
        <div class="card-header"><h2><i class="fas fa-undo-alt"></i> คืน/เปลี่ยนสินค้า</h2></div>
        <div class="card-body">
          <div style="background:#f8fafc; border-radius:24px; padding:20px; margin-bottom:24px;">
            <div class="form-row">
              <div class="form-group" style="flex:2; position:relative;">
                <label>🔍 เลือกสินค้าที่คืน</label>
                <input type="text" id="returnProductInput" placeholder="พิมพ์ Itemcode หรือชื่อสินค้า..." autocomplete="off">
                <div id="returnDropdownList" style="display:none; position:absolute; background:white; border:1px solid #ccc; border-radius:16px; max-height:250px; overflow:auto; z-index:100;"></div>
              </div>
              <div class="form-group"><label>จำนวน</label><input type="number" id="returnQty" min="1" value="1"></div>
              <div class="form-group"><label>วันที่</label><input type="date" id="returnDate"></div>
            </div>
            <div class="form-row">
              <div class="form-group"><label>ผู้รับคืน</label><input type="text" id="returnReceiver" placeholder="ชื่อผู้รับคืน"></div>
              <div class="form-group"><label>ผู้คืน</label><input type="text" id="returnReturner" placeholder="ชื่อผู้คืน"></div>
              <div class="form-group" style="position:relative;">
                <label>🔍 แผนก</label>
                <input type="text" id="returnDeptInput" placeholder="พิมพ์ชื่อแผนก..." autocomplete="off">
                <div id="returnDeptDropdownList" style="display:none; position:absolute; background:white; border:1px solid #ccc; border-radius:16px; max-height:200px; overflow:auto; z-index:100;"></div>
              </div>
              <div class="form-group"><button id="recordReturnBtn" class="btn btn-primary">บันทึก</button></div>
            </div>
            <div class="form-group"><label>หมายเหตุ</label><input type="text" id="returnNote" placeholder="เหตุผล"></div>
            <div id="selectedReturnProductDisplay" style="display:none; margin-top:12px; background:#eef2ff; padding:8px 16px; border-radius:20px;">✅ <span id="selectedReturnProductName"></span></div>
          </div>
          
          <div class="filter-bar">
            <input type="text" id="returnHistorySearch" placeholder="🔍 ค้นหา...">
            <button id="resetReturnHistoryBtn" class="btn btn-sm">รีเซ็ต</button>
            <button id="exportReturnHistoryExcelBtn" class="btn btn-sm" style="background:#10b981; color:white;">📎 ส่งออก Excel</button>
          </div>
          
          <div class="table-wrapper">
            <table style="min-width:1000px">
              <thead><tr><th>วันที่</th><th>ประเภท</th><th>Itemcode</th><th>สินค้า</th><th>จำนวน</th><th>ผู้รับคืน</th><th>ผู้คืน</th><th>แผนก</th><th>หมายเหตุ</th></tr></thead>
              <tbody id="returnHistoryTbody"></tbody>
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
  
  updateReturnDropdownList(searchText) {
    const products = AppStorage.products;
    const dropdown = document.getElementById("returnDropdownList");
    if (!dropdown) return;
    if (!searchText.trim()) { dropdown.style.display = "none"; return; }
    
    const filtered = products.filter(p => p.itemcode.toLowerCase().includes(searchText.toLowerCase()) || p.description.toLowerCase().includes(searchText.toLowerCase()));
    if (filtered.length === 0) { dropdown.style.display = "none"; return; }
    
    let html = "";
    filtered.slice(0, 15).forEach(p => {
      html += `<div class="return-item" data-code="${p.itemcode}" data-name="${p.description}" data-price="${p.price}" data-stock="${p.quantity}" style="padding:10px; cursor:pointer; border-bottom:1px solid #eee;">📦 ${p.itemcode} - ${p.description.substring(0,40)} <span style="float:right;">เหลือ ${p.quantity}</span></div>`;
    });
    dropdown.innerHTML = html;
    dropdown.style.display = "block";
    
    document.querySelectorAll(".return-item").forEach(item => {
      item.addEventListener("click", () => {
        this.selectedProduct = {
          itemcode: item.dataset.code,
          description: item.dataset.name,
          price: parseFloat(item.dataset.price),
          quantity: parseInt(item.dataset.stock)
        };
        document.getElementById("returnProductInput").value = `${this.selectedProduct.itemcode} - ${this.selectedProduct.description.substring(0,50)}`;
        document.getElementById("selectedReturnProductDisplay").style.display = "block";
        document.getElementById("selectedReturnProductName").innerHTML = `${this.selectedProduct.itemcode} - ${this.selectedProduct.description}`;
        dropdown.style.display = "none";
      });
    });
  },
  
  updateReturnDeptDropdownList(searchText) {
    const dropdown = document.getElementById("returnDeptDropdownList");
    if (!dropdown) return;
    if (!searchText.trim()) { dropdown.style.display = "none"; return; }
    
    const filtered = this.departments.filter(d => d.toLowerCase().includes(searchText.toLowerCase()));
    if (filtered.length === 0) { dropdown.style.display = "none"; return; }
    
    let html = "";
    filtered.forEach(d => {
      html += `<div class="return-dept-item" data-dept="${d}" style="padding:10px; cursor:pointer; border-bottom:1px solid #eee;">🏢 ${d}</div>`;
    });
    dropdown.innerHTML = html;
    dropdown.style.display = "block";
    
    document.querySelectorAll(".return-dept-item").forEach(item => {
      item.addEventListener("click", () => {
        this.selectedDepartment = item.dataset.dept;
        document.getElementById("returnDeptInput").value = this.selectedDepartment;
        dropdown.style.display = "none";
      });
    });
  },
  
  async recordReturn() {
    if (!this.selectedProduct) { alert("กรุณาเลือกสินค้า"); return; }
    if (!this.selectedDepartment) { alert("กรุณาเลือกแผนก"); return; }
    
    const qty = parseInt(document.getElementById("returnQty").value);
    if (isNaN(qty) || qty <= 0) { alert("จำนวนต้องมากกว่า 0"); return; }
    
    const receiver = document.getElementById("returnReceiver").value.trim();
    const returner = document.getElementById("returnReturner").value.trim();
    const date = document.getElementById("returnDate").value || Helpers.formatDate();
    const note = document.getElementById("returnNote").value.trim() || "-";
    
    if (!receiver) { alert("กรุณากรอกผู้รับคืน"); return; }
    if (!returner) { alert("กรุณากรอกผู้คืน"); return; }
    
    const returnData = {
      type: "return", date,
      oldItemcode: this.selectedProduct.itemcode,
      oldDescription: this.selectedProduct.description,
      oldQty: qty,
      newItemcode: "-", newDescription: "-", newQty: 0,
      receiver, returner: returner, changer: "",
      department: this.selectedDepartment, note,
      timestamp: Helpers.getCurrentTimestamp()
    };
    
    const result = await API.saveReturn(returnData);
    if (result && result.success) {
      const product = AppStorage.products.find(p => p.itemcode === this.selectedProduct.itemcode);
      if (product) product.quantity += qty;
      AppStorage.returns.push(returnData);
      AppStorage.saveLocalBackup();
      
      this.renderReturnHistory();
      StockComponent.renderStockTable();
      Helpers.updateStats();
      
      document.getElementById("returnProductInput").value = "";
      document.getElementById("returnQty").value = "1";
      document.getElementById("returnReceiver").value = "";
      document.getElementById("returnReturner").value = "";
      document.getElementById("returnDeptInput").value = "";
      document.getElementById("returnNote").value = "";
      document.getElementById("selectedReturnProductDisplay").style.display = "none";
      this.selectedProduct = null;
      this.selectedDepartment = "";
      
      alert("✅ บันทึกการคืนสินค้าสำเร็จ!");
    } else {
      alert("❌ บันทึกไม่สำเร็จ");
    }
  },
  
  renderReturnHistory(filterText = "") {
    let filtered = [...AppStorage.returns];
    if (filterText) filtered = filtered.filter(r => r.oldItemcode.includes(filterText) || r.oldDescription.includes(filterText));
    filtered.sort((a, b) => b.date.localeCompare(a.date));
    
    const tbody = document.getElementById("returnHistoryTbody");
    if (!tbody) return;
    if (filtered.length === 0) { tbody.innerHTML = "<tr><td colspan='9'>ไม่มีประวัติ</td></tr>"; return; }
    
    let html = "";
    filtered.forEach(r => {
      html += `<tr>
        <td>${this.formatDateToThai(r.date)}</td>
        <td>คืนสินค้า</td>
        <td>${r.oldItemcode}</td>
        <td>${r.oldDescription}</td>
        <td>${r.oldQty}</td>
        <td>${r.receiver || "-"}</td>
        <td>${r.returner || "-"}</td>
        <td>${r.department || "-"}</td>
        <td>${r.note || "-"}</td>
      </tr>`;
    });
    tbody.innerHTML = html;
  }
};

const StockComponent = {
  render() {
    return `
      <div class="card">
        <div class="card-header">
          <h2><i class="fas fa-boxes"></i> คลังสินค้าทั้งหมด</h2>
          <div class="search-box">
            <i class="fas fa-search"></i>
            <input type="text" id="stockSearch" placeholder="ค้นหา Itemcode หรือ ชื่อสินค้า...">
          </div>
        </div>
        <div class="card-body">
          <div class="table-wrapper">
            <table style="min-width:800px">
              <thead>
                <tr><th>#</th><th>Itemcode</th><th>สินค้า</th><th>หน่วย</th><th>ราคา</th><th>สต๊อก</th><th>สถานะ</th><th>จุดสั่งซื้อ</th><th>จัดการ</th</tr>
              </thead>
              <tbody id="stockTbody"></tbody>
            </table>
          </div>
          <div class="footer-note">
            <i class="fas fa-edit"></i> คลิกดินสอปรับสต๊อก | <i class="fas fa-bell"></i> คลิกตัวเลขจุดสั่งซื้อเพื่อตั้งค่า
          </div>
        </div>
      </div>
    `;
  },
  
  renderStockTable(filter = "") {
    const products = AppStorage.products;
    const filtered = products.filter(p => 
      p.itemcode.toLowerCase().includes(filter.toLowerCase()) || 
      p.description.toLowerCase().includes(filter.toLowerCase())
    );
    
    const tbody = document.getElementById("stockTbody");
    if (!tbody) return;
    
    if (filtered.length === 0) {
      tbody.innerHTML = "<tr><td colspan='9' style='text-align:center; padding:40px;'>ไม่พบสินค้า</td></tr>";
      return;
    }
    
    let html = "";
    filtered.forEach((p, idx) => {
      const reorderPoint = p.reorderPoint || 10;
      const needReorder = (p.quantity || 0) <= reorderPoint;
      const statusHtml = needReorder ? '<span class="badge-low">⚠️ ควรสั่งซื้อ</span>' : '<span style="color:#10b981;">✅ ปกติ</span>';
      
      html += `
        <tr>
          <td>${idx + 1}</td>
          <td style="font-family:monospace;">${p.itemcode}</td>
          <td style="max-width:300px;">${p.description}</td>
          <td>${p.unit || "EA"}</td>
          <td>${(p.price || 0).toFixed(2)}</td>
          <td style="font-weight:600; ${needReorder ? 'color:#dc2626;' : ''}">${p.quantity || 0}</td>
          <td>${statusHtml}</td>
          <td class="reorder-cell"><span class="reorder-value" data-code="${p.itemcode}" style="cursor:pointer; background:#f1f5f9; padding:6px 14px; border-radius:20px; font-size:0.75rem;">🔔 ${reorderPoint}</span></td>
          <td class="action-icons"><i class="fas fa-edit edit-stock" data-code="${p.itemcode}" style="cursor:pointer;"></i></td>
        </tr>
      `;
    });
    
    tbody.innerHTML = html;
    this.attachEvents();
    this.updateReorderCount();
  },
  
  attachEvents() {
    document.querySelectorAll(".edit-stock").forEach(btn => {
      btn.removeEventListener("click", this.handleEditStock);
      btn.addEventListener("click", this.handleEditStock);
    });
    
    document.querySelectorAll(".reorder-value").forEach(el => {
      el.removeEventListener("click", this.handleReorderClick);
      el.addEventListener("click", this.handleReorderClick);
    });
  },
  
  handleEditStock(e) {
    const code = e.currentTarget.getAttribute("data-code");
    const product = AppStorage.products.find(p => p.itemcode === code);
    const newQty = prompt("ปรับจำนวนสต๊อก:", product.quantity);
    if (newQty !== null && !isNaN(parseInt(newQty)) && parseInt(newQty) >= 0) {
      StockComponent.updateStockQuantity(code, parseInt(newQty));
    }
  },
  
  handleReorderClick(e) {
    e.stopPropagation();
    const code = e.currentTarget.getAttribute("data-code");
    const product = AppStorage.products.find(p => p.itemcode === code);
    const currentValue = product.reorderPoint || 10;
    const newValue = prompt("ตั้งค่าจุดสั่งซื้อ (จำนวนขั้นต่ำที่แจ้งเตือน):", currentValue);
    if (newValue !== null && !isNaN(parseInt(newValue)) && parseInt(newValue) >= 0) {
      StockComponent.updateReorderPoint(code, parseInt(newValue));
    }
  },
  
  async updateStockQuantity(code, newQty) {
    const product = AppStorage.products.find(p => p.itemcode === code);
    if (product) {
      const oldQty = product.quantity;
      product.quantity = newQty;
      await API.updateProduct(product);
      await API.updateStock(code, newQty - oldQty);
      this.renderStockTable(document.getElementById("stockSearch")?.value || "");
      Helpers.updateStats();
      this.updateReorderCount();
      API.showToast(`อัพเดตสต๊อก ${code} = ${newQty}`, false);
    }
  },
  
  async updateReorderPoint(code, newPoint) {
    const product = AppStorage.products.find(p => p.itemcode === code);
    if (product) {
      product.reorderPoint = newPoint;
      await API.updateProduct(product);
      this.renderStockTable(document.getElementById("stockSearch")?.value || "");
      this.updateReorderCount();
      API.showToast(`ตั้งค่าจุดสั่งซื้อ ${code} = ${newPoint}`, false);
    }
  },
  
  updateReorderCount() {
    const products = AppStorage.products;
    const reorderCount = products.filter(p => (p.quantity || 0) <= (p.reorderPoint || 10)).length;
    const lowStockStat = document.getElementById("lowStockStat");
    if (lowStockStat) lowStockStat.innerText = reorderCount;
  }
};

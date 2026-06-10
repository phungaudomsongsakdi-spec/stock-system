let AppStorage = {
  products: [],
  movements: [],
  receives: [],
  returns: [],
  isLoading: false,
  autoRefreshTimer: null,
  
  async loadData() {
    if (this.isLoading) return;
    this.isLoading = true;
    
    try {
      const [products, movements, receives, returns] = await Promise.all([
        API.getProducts(),
        API.getMovements(),
        API.getReceives(),
        API.getReturns()
      ]);
      
      if (products && products.length > 0) this.products = products;
      if (movements) this.movements = movements;
      if (receives) this.receives = receives;
      if (returns) this.returns = returns;
      
      console.log(`✅ โหลดข้อมูลสำเร็จ: สินค้า ${this.products.length} รายการ, เบิก ${this.movements.length}, รับเข้า ${this.receives.length}, คืน ${this.returns.length}`);
      
      this.saveLocalBackup();
      
    } catch (error) {
      console.error("❌ โหลดข้อมูลล้มเหลว:", error);
      this.loadFromLocalBackup();
    }
    
    this.isLoading = false;
  },
  
  loadFromLocalBackup() {
    try {
      const backup = localStorage.getItem("stock_backup");
      if (backup) {
        const data = JSON.parse(backup);
        if (data.products && data.products.length > 0) this.products = data.products;
        if (data.movements) this.movements = data.movements;
        if (data.receives) this.receives = data.receives;
        if (data.returns) this.returns = data.returns;
        console.log("📦 ใช้ข้อมูลจาก Local Backup");
        API.showToast("ใช้ข้อมูลสำรองในเครื่อง", false);
      }
    } catch (e) {
      console.error("อ่าน backup ล้มเหลว:", e);
    }
  },
  
  saveLocalBackup() {
    try {
      localStorage.setItem("stock_backup", JSON.stringify({
        products: this.products,
        movements: this.movements,
        receives: this.receives,
        returns: this.returns,
        timestamp: new Date().toISOString()
      }));
    } catch (e) {
      console.error("บันทึก backup ล้มเหลว:", e);
    }
  },
  
  initProducts() {
    const allProducts = [...ProductsData.rawProducts, ...ProductsData.extraProducts];
    this.products = allProducts.map((p, idx) => ({
      id: p[1],
      itemcode: p[1],
      description: p[2],
      unit: p[3],
      price: (p[4] !== "" && !isNaN(parseFloat(p[4]))) ? parseFloat(p[4]) : 0,
      quantity: Math.floor(Math.random() * 50) + 10,
      reorderPoint: 10
    }));
    
    console.log(`📦 สร้างสินค้าเริ่มต้น ${this.products.length} รายการ`);
    this.saveLocalBackup();
  },
  
  async refreshData() {
    await this.loadData();
    if (window.StockComponent) StockComponent.renderStockTable();
    if (window.MovementComponent) MovementComponent.renderMovementsHistory();
    if (window.ReceiveComponent) ReceiveComponent.renderReceiveHistory();
    if (window.ReturnComponent) ReturnComponent.renderReturnHistory();
    Helpers.updateStats();
    API.showToast("อัพเดตข้อมูลล่าสุดแล้ว", false);
  },
  
  startAutoRefresh() {
    if (this.autoRefreshTimer) clearInterval(this.autoRefreshTimer);
    this.autoRefreshTimer = setInterval(() => {
      this.refreshData();
    }, CONFIG.AUTO_REFRESH_INTERVAL);
  },
  
  stopAutoRefresh() {
    if (this.autoRefreshTimer) {
      clearInterval(this.autoRefreshTimer);
      this.autoRefreshTimer = null;
    }
  }
};

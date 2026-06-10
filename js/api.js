const API = {
  async request(action, data = null) {
    try {
      let url = `${CONFIG.API_URL}?action=${action}&_t=${Date.now()}`;
      let options = { method: "GET", mode: "cors" };
      
      if (data) {
        options = {
          method: "POST",
          mode: "cors",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({ data: JSON.stringify(data) })
        };
      }
      
      const response = await fetch(url, options);
      const result = await response.json();
      
      if (!result || result.success === false) {
        console.error(`API Error (${action}):`, result?.error);
        return null;
      }
      
      return result.data || result;
    } catch (error) {
      console.error(`API fetch error (${action}):`, error);
      return null;
    }
  },
  
  async getProducts() {
    const result = await this.request("getProducts");
    return result || [];
  },
  
  async getMovements() {
    const result = await this.request("getMovements");
    return result || [];
  },
  
  async getReceives() {
    const result = await this.request("getReceives");
    return result || [];
  },
  
  async getReturns() {
    const result = await this.request("getReturns");
    return result || [];
  },
  
  async saveMovement(movement) {
    return await this.request("saveMovement", movement);
  },
  
  async saveReceive(receive) {
    return await this.request("saveReceive", receive);
  },
  
  async saveReturn(returnData) {
    return await this.request("saveReturn", returnData);
  },
  
  async updateStock(itemcode, change) {
    try {
      const url = `${CONFIG.API_URL}?action=updateStock&itemcode=${encodeURIComponent(itemcode)}&change=${change}&_t=${Date.now()}`;
      const response = await fetch(url);
      return await response.json();
    } catch (error) {
      console.error("Update stock error:", error);
      return { success: false };
    }
  },
  
  async updateProduct(product) {
    return await this.request("updateProduct", product);
  },
  
  showToast(message, isError = false) {
    const existing = document.querySelector(".custom-toast");
    if (existing) existing.remove();
    
    const toast = document.createElement("div");
    toast.className = "custom-toast";
    toast.style.cssText = `position:fixed; bottom:20px; right:20px; background:${isError ? '#dc2626' : '#10b981'}; color:white; padding:12px 24px; border-radius:40px; font-size:0.85rem; z-index:10000; box-shadow:0 4px 12px rgba(0,0,0,0.2);`;
    toast.innerHTML = `<i class="fas ${isError ? 'fa-exclamation-triangle' : 'fa-check-circle'}"></i> ${message}`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  }
};

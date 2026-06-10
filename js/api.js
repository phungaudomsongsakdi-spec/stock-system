const API = {
  async request(action, data = null) {
    try {
      let url = `${CONFIG.API_URL}?action=${action}&t=${Date.now()}`;
      let options = { method: "GET", mode: "cors" };
      
      if (data) {
        url = `${CONFIG.API_URL}?action=${action}&t=${Date.now()}`;
        options = {
          method: "POST",
          mode: "cors",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: `data=${JSON.stringify(data)}`
        };
      }
      
      const response = await fetch(url, options);
      const result = await response.json();
      
      if (!result.success) {
        console.error(`API Error (${action}):`, result.error);
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
    const url = `${CONFIG.API_URL}?action=updateStock&itemcode=${encodeURIComponent(itemcode)}&change=${change}&t=${Date.now()}`;
    try {
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
  
  async syncAll() {
    const result = await this.request("syncAll");
    return result;
  },
  
  showToast(message, isError = false) {
    const existingToast = document.querySelector(".loading-toast");
    if (existingToast) existingToast.remove();
    
    const toast = document.createElement("div");
    toast.className = "loading-toast";
    toast.style.backgroundColor = isError ? "#dc2626" : "#10b981";
    toast.innerHTML = `<i class="fas ${isError ? 'fa-exclamation-triangle' : 'fa-check-circle'}"></i> ${message}`;
    document.body.appendChild(toast);
    
    setTimeout(() => toast.remove(), 3000);
  }
};

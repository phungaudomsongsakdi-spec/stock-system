const Helpers = {
  formatDate(dateStr) {
    if (!dateStr) return new Date().toISOString().slice(0, 10);
    return dateStr;
  },
  
  getCurrentTimestamp() {
    const now = new Date();
    return now.toLocaleString('th-TH', { hour12: false });
  },
  
  formatDateToThai(dateStr) {
    if (!dateStr) return "-";
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const day = parts[2].padStart(2, '0');
      const month = parts[1].padStart(2, '0');
      const year = parseInt(parts[0]) + 543;
      return `${day}/${month}/${year}`;
    }
    return dateStr;
  },
  
  formatTimestamp(timestamp) {
    if (!timestamp) return "-";
    return timestamp;
  },
  
  updateStats() {
    const products = AppStorage.products;
    document.getElementById("totalItemsStat").innerText = products.length;
    document.getElementById("totalStockStat").innerText = products.reduce((s, p) => s + (p.quantity || 0), 0);
    
    const lowStockCount = products.filter(p => (p.quantity || 0) <= (p.reorderPoint || 10)).length;
    document.getElementById("lowStockStat").innerText = lowStockCount;
  },
  
  numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  },
  
  showNotification(message, type = "info") {
    API.showToast(message, type === "error");
  }
};

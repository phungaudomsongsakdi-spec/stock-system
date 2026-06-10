let App = {
  currentTab: "stock",
  
  async init() {
    document.getElementById("loadingOverlay").style.display = "flex";
    
    await AppStorage.loadData();
    
    if (AppStorage.products.length === 0) {
      AppStorage.initProducts();
      await new Promise(resolve => setTimeout(resolve, 500));
      await AppStorage.loadData();
    }
    
    document.getElementById("loadingOverlay").style.display = "none";
    
    this.loadTabContent();
    this.bindEvents();
    this.onTabChange();
    
    AppStorage.startAutoRefresh();
    Helpers.updateStats();
  },
  
  loadTabContent() {
    document.getElementById("stockPane").innerHTML = StockComponent.render();
    document.getElementById("movementPane").innerHTML = MovementComponent.render();
    document.getElementById("receivePane").innerHTML = ReceiveComponent.render();
    document.getElementById("returnPane").innerHTML = ReturnComponent.render();
    document.getElementById("reportsPane").innerHTML = ReportComponent.render();
  },
  
  bindEvents() {
    document.querySelectorAll(".tab-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        document.querySelectorAll(".tab-pane").forEach(p => p.classList.remove("active-pane"));
        document.getElementById(btn.dataset.tab + "Pane").classList.add("active-pane");
        this.currentTab = btn.dataset.tab;
        this.onTabChange();
      });
    });
  },
  
  onTabChange() {
    Helpers.updateStats();
    
    switch (this.currentTab) {
      case "stock":
        StockComponent.renderStockTable("");
        const stockSearch = document.getElementById("stockSearch");
        if (stockSearch) {
          stockSearch.oninput = (e) => StockComponent.renderStockTable(e.target.value);
        }
        break;
        
      case "movement":
        MovementComponent.renderMovementsHistory();
        
        const productInput = document.getElementById("movementProductInput");
        if (productInput) {
          productInput.oninput = (e) => MovementComponent.updateDropdownList(e.target.value);
        }
        
        const deptInput = document.getElementById("movementDeptInput");
        if (deptInput) {
          deptInput.oninput = (e) => MovementComponent.updateDeptDropdownList(e.target.value);
        }
        
        document.getElementById("recordMovementBtn").onclick = () => MovementComponent.recordMovement();
        document.getElementById("movementDate").value = Helpers.formatDate();
        
        document.getElementById("historySearch").oninput = () => MovementComponent.renderMovementsHistory(
          document.getElementById("historySearch").value,
          document.getElementById("historyTypeFilter").value,
          document.getElementById("historyDeptInput").value,
          document.getElementById("historyDateFrom").value,
          document.getElementById("historyDateTo").value
        );
        
        document.getElementById("historyTypeFilter").onchange = () => MovementComponent.renderMovementsHistory(
          document.getElementById("historySearch").value,
          document.getElementById("historyTypeFilter").value,
          document.getElementById("historyDeptInput").value,
          document.getElementById("historyDateFrom").value,
          document.getElementById("historyDateTo").value
        );
        
        document.getElementById("historyDeptInput").oninput = () => MovementComponent.renderMovementsHistory(
          document.getElementById("historySearch").value,
          document.getElementById("historyTypeFilter").value,
          document.getElementById("historyDeptInput").value,
          document.getElementById("historyDateFrom").value,
          document.getElementById("historyDateTo").value
        );
        
        document.getElementById("historyDateFrom").onchange = () => MovementComponent.renderMovementsHistory(
          document.getElementById("historySearch").value,
          document.getElementById("historyTypeFilter").value,
          document.getElementById("historyDeptInput").value,
          document.getElementById("historyDateFrom").value,
          document.getElementById("historyDateTo").value
        );
        
        document.getElementById("historyDateTo").onchange = () => MovementComponent.renderMovementsHistory(
          document.getElementById("historySearch").value,
          document.getElementById("historyTypeFilter").value,
          document.getElementById("historyDeptInput").value,
          document.getElementById("historyDateFrom").value,
          document.getElementById("historyDateTo").value
        );
        
        document.getElementById("resetHistoryBtn").onclick = () => {
          document.getElementById("historySearch").value = "";
          document.getElementById("historyTypeFilter").value = "";
          document.getElementById("historyDeptInput").value = "";
          document.getElementById("historyDateFrom").value = "";
          document.getElementById("historyDateTo").value = "";
          MovementComponent.renderMovementsHistory();
        };
        
        document.getElementById("exportHistoryExcelBtn").onclick = () => MovementComponent.exportToExcel();
        break;
        
      case "receive":
        ReceiveComponent.renderReceiveHistory();
        
        const receiveInput = document.getElementById("receiveProductInput");
        if (receiveInput) {
          receiveInput.oninput = (e) => ReceiveComponent.updateReceiveDropdownList(e.target.value);
        }
        
        document.getElementById("receiveDate").value = Helpers.formatDate();
        document.getElementById("recordReceiveBtn").onclick = () => ReceiveComponent.recordReceive();
        
        document.getElementById("receiveHistorySearch").oninput = (e) => ReceiveComponent.renderReceiveHistory(e.target.value);
        document.getElementById("resetReceiveHistoryBtn").onclick = () => {
          document.getElementById("receiveHistorySearch").value = "";
          ReceiveComponent.renderReceiveHistory();
        };
        break;
        
      case "return":
        ReturnComponent.renderReturnHistory();
        
        const returnInput = document.getElementById("returnProductInput");
        if (returnInput) {
          returnInput.oninput = (e) => ReturnComponent.updateReturnDropdownList(e.target.value);
        }
        
        const returnDeptInput = document.getElementById("returnDeptInput");
        if (returnDeptInput) {
          returnDeptInput.oninput = (e) => ReturnComponent.updateReturnDeptDropdownList(e.target.value);
        }
        
        document.getElementById("returnDate").value = Helpers.formatDate();
        document.getElementById("recordReturnBtn").onclick = () => ReturnComponent.recordReturn();
        
        document.getElementById("returnHistorySearch").oninput = (e) => ReturnComponent.renderReturnHistory(e.target.value);
        document.getElementById("resetReturnHistoryBtn").onclick = () => {
          document.getElementById("returnHistorySearch").value = "";
          ReturnComponent.renderReturnHistory();
        };
        break;
        
      case "reports":
        ReportComponent.renderMonthlyReport();
        document.getElementById("monthReportPicker").onchange = () => ReportComponent.renderMonthlyReport();
        document.getElementById("exportMonthCSV").onclick = () => ReportComponent.exportMonthCSV();
        break;
    }
    
    // ปิด dropdown เมื่อคลิกภายนอก
    document.addEventListener("click", (e) => {
      if (!e.target.closest("#movementDropdownList") && !e.target.closest("#movementProductInput")) {
        const dl = document.getElementById("movementDropdownList");
        if (dl) dl.style.display = "none";
      }
      if (!e.target.closest("#movementDeptDropdownList") && !e.target.closest("#movementDeptInput")) {
        const dl = document.getElementById("movementDeptDropdownList");
        if (dl) dl.style.display = "none";
      }
      if (!e.target.closest("#receiveDropdownList") && !e.target.closest("#receiveProductInput")) {
        const dl = document.getElementById("receiveDropdownList");
        if (dl) dl.style.display = "none";
      }
      if (!e.target.closest("#returnDropdownList") && !e.target.closest("#returnProductInput")) {
        const dl = document.getElementById("returnDropdownList");
        if (dl) dl.style.display = "none";
      }
    });
  }
};

document.addEventListener("DOMContentLoaded", () => App.init());

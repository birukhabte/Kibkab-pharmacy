package router

import (
	"log"
	"net/http"
	"os"
	"time"

	"github.com/gechjs/Pharmacy-App/internal/handlers/activity"
	"github.com/gechjs/Pharmacy-App/internal/handlers/alerts"
	"github.com/gechjs/Pharmacy-App/internal/handlers/analytics"
	"github.com/gechjs/Pharmacy-App/internal/handlers/auth"
	"github.com/gechjs/Pharmacy-App/internal/handlers/branches"
	commissions "github.com/gechjs/Pharmacy-App/internal/handlers/commissions"
	"github.com/gechjs/Pharmacy-App/internal/handlers/customers"
	"github.com/gechjs/Pharmacy-App/internal/handlers/employees"
	medicine_stock "github.com/gechjs/Pharmacy-App/internal/handlers/medicine_stocks"
	"github.com/gechjs/Pharmacy-App/internal/handlers/medicines"
	"github.com/gechjs/Pharmacy-App/internal/handlers/orders"
	"github.com/gechjs/Pharmacy-App/internal/handlers/permissions"
	"github.com/gechjs/Pharmacy-App/internal/handlers/recurring"
	"github.com/gechjs/Pharmacy-App/internal/handlers/reports"
	"github.com/gechjs/Pharmacy-App/internal/handlers/roles"
	"github.com/gechjs/Pharmacy-App/internal/handlers/sale_items"
	"github.com/gechjs/Pharmacy-App/internal/handlers/sales"
	"github.com/gechjs/Pharmacy-App/internal/handlers/suppliers"
	"github.com/gechjs/Pharmacy-App/internal/middlewares"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func RunServer() {
	gin.SetMode(gin.ReleaseMode)
	router := gin.Default()

	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{os.Getenv("FRONTEND"), os.Getenv("FRONTEND2")},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	router.NoRoute(middlewares.NewRateLimiterMiddleware(1, 1))
	api := router.Group("/api")
	api.Use(middlewares.Authentication)
	router.GET("/api/ping", middlewares.NewRateLimiterMiddleware(10, 1), func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"pong": "true"})
	})

	authGroup := router.Group("/api/auth")
	{
		authGroup.POST("/login", middlewares.NewRateLimiterMiddleware(5, 1), auth.Login)
		authGroup.POST("/logout", middlewares.NewRateLimiterMiddleware(5, 1), middlewares.Authentication, auth.Logout)
	}

	router.GET("/check-auth", middlewares.NewRateLimiterMiddleware(200, 1), middlewares.Authentication, func(c *gin.Context) {
		c.JSON(200, gin.H{"message": "authenticated"})
	})

	api.Use(middlewares.NewRateLimiterMiddleware(200, 1))

	branchesGroup := api.Group("/branches")
	{
		branchesGroup.GET("", branches.GetAllBranches)
		branchesGroup.GET("/:id", branches.GetBranchByID)
		branchesGroup.POST("", middlewares.PermissionMiddleware(middlewares.PermManageBranches), branches.CreateBranch)
		branchesGroup.PUT("/:id", middlewares.PermissionMiddleware(middlewares.PermManageBranches), branches.UpdateBranch)
		branchesGroup.DELETE("/:id", middlewares.PermissionMiddleware(middlewares.PermManageBranches), branches.DeleteBranch)
	}

	customersGroup := api.Group("/customers")
	{
		customersGroup.GET("", customers.GetAllCustomers)
		customersGroup.GET("/:id", customers.GetCustomerByID)
		customersGroup.POST("", middlewares.PermissionMiddleware(middlewares.PermManageCustomers), customers.CreateCustomer)
		customersGroup.PUT("/:id", middlewares.PermissionMiddleware(middlewares.PermManageCustomers), customers.UpdateCustomer)
		customersGroup.DELETE("/:id", middlewares.PermissionMiddleware(middlewares.PermManageCustomers), customers.DeleteCustomer)
	}

	employeesGroup := api.Group("/employees")
	{
		employeesGroup.GET("", employees.GetAllEmployees)
		employeesGroup.GET("/:id", employees.GetEmployeeByID)
		employeesGroup.GET("/daily-sales", employees.GetOwnDailySalesReport)
		employeesGroup.GET("/my-commission", employees.GetMyCommissions)
		employeesGroup.POST("", middlewares.PermissionMiddleware(middlewares.PermManageEmployees), employees.CreateEmployee)
		employeesGroup.PUT("/:id", middlewares.PermissionMiddleware(middlewares.PermManageEmployees), employees.UpdateEmployee)
		employeesGroup.DELETE("/:id", middlewares.PermissionMiddleware(middlewares.PermManageEmployees), employees.DeleteEmployee)
	}

	medicinesGroup := api.Group("/medicines")
	{
		medicinesGroup.GET("", medicines.GetAllMedicines)
		medicinesGroup.GET("/:id", medicines.GetMedicineByID)
		medicinesGroup.POST("", medicines.CreateMedicine)
		medicinesGroup.PUT("/:id", medicines.UpdateMedicine)
		medicinesGroup.DELETE("/:id", medicines.DeleteMedicine)
	}

	roleGroup := api.Group("/roles")
	roleGroup.Use()
	{
		roleGroup.GET("", roles.GetAllRoles)
		roleGroup.GET("/:id", roles.GetRoleByID)
		roleGroup.POST("", middlewares.PermissionMiddleware(middlewares.PermManageRoles), roles.CreateRole)
		roleGroup.PUT("/:id", middlewares.PermissionMiddleware(middlewares.PermManageRoles), roles.UpdateRole)
		roleGroup.DELETE("/:id", middlewares.PermissionMiddleware(middlewares.PermManageRoles), roles.DeleteRole)
	}

	stockGroup := api.Group("/stocks")
	{
		stockGroup.GET("", medicine_stock.GetAllStock)
		stockGroup.GET("/:id", medicine_stock.GetStockByID)
		stockGroup.POST("", medicine_stock.CreateStock)
		stockGroup.PUT("/:id", middlewares.PermissionMiddleware(middlewares.PermAdjustStock), medicine_stock.UpdateStock)
		stockGroup.DELETE("/:id", middlewares.PermissionMiddleware(middlewares.PermAdjustStock), medicine_stock.DeleteStock)
		stockGroup.POST("/transfer", middlewares.PermissionMiddleware(middlewares.PermAdjustStock), medicine_stock.TransferMedicineStock)
		stockGroup.GET("/expiring", medicine_stock.GetExpiringStock)
	}

	supplierGroup := api.Group("/suppliers")
	{
		supplierGroup.GET("", suppliers.GetAllSuppliers)
		supplierGroup.GET("/:id", suppliers.GetSupplierByID)
		supplierGroup.POST("", suppliers.CreateSupplier)
		supplierGroup.PUT("/:id", suppliers.UpdateSupplier)
		supplierGroup.DELETE("/:id", suppliers.DeleteSupplier)
	}

	salesGroup := api.Group("/sales")
	{
		salesGroup.GET("", sales.GetAllSales)
		salesGroup.GET("/:id", sales.GetSaleByID)
		salesGroup.PUT("/:id", middlewares.PermissionMiddleware(middlewares.PermApproveSale), sales.UpdateSaleStatus)
		salesGroup.POST("", middlewares.PermissionMiddleware(middlewares.PermCreateSale), sales.CreateSale)
	}

	saleItemGroup := api.Group("/sale-items")
	{
		saleItemGroup.GET("", sale_items.GetAllSaleItems)
		saleItemGroup.GET("/:id", sale_items.GetSaleItemByID)
	}

	recurringSale := api.Group("/recurring")
	{
		recurringSale.POST("", recurring.CreateRecurringSale)
		recurringSale.PUT("/:id", recurring.UpdateRecurringSale)
		recurringSale.GET("", recurring.GetRecurringSales)
		recurringSale.GET("/customer/:id", recurring.GetCustomerRecurringSales)
		recurringSale.DELETE("/:id", recurring.DeleteRecurringSale)
	}

	orderGroup := api.Group("/orders")
	{
		orderGroup.POST("", middlewares.PermissionMiddleware(middlewares.PermCreateOrder), orders.CreateOrder)
		orderGroup.PUT("", middlewares.PermissionMiddleware(middlewares.PermCreateOrder), orders.UpdateOrderStatus)
		orderGroup.POST("/pay", middlewares.PermissionMiddleware(middlewares.PermPayOrder), orders.CreateOrderPayment)
		orderGroup.GET("", orders.GetOrders)
	}

	reportGroup := api.Group("/reports")
	reportGroup.Use(middlewares.PermissionMiddleware(middlewares.PermViewReports))
	{
		reportGroup.GET("/employee-daily", reports.GetEmployeeSalesReport)
		reportGroup.GET("/all-employee-daily", reports.GetAllEmployeeDailySale)
		reportGroup.GET("/active-prescriptions", reports.CountActiveRecurringSales)
		reportGroup.GET("/low-stocks", reports.GetLowStockReport)
		reportGroup.GET("/today-sales", reports.ReportTodaySales)
		reportGroup.GET("/recent-sales", reports.GetRecentSales)
		reportGroup.GET("/refills", reports.GetRefillReminders)
		reportGroup.GET("/total-customers", reports.TotalCustomers)
		reportGroup.GET("/total-medicines", reports.TotalMedicineStock)
	}

	commissionGroup := api.Group("/commissions")
	{
		commissionGroup.PUT("/pay/:id", middlewares.PermissionMiddleware(middlewares.PermPayCommission), commissions.PayCommission)
		commissionGroup.GET("", commissions.GetUnpaidCommissions)
	}

	permissionGroup := api.Group("/permissions")
	{
		permissionGroup.GET("", permissions.GetAllPermission)
		permissionGroup.GET("/has/:permission", middlewares.Authentication, permissions.HasPermission)
	}

	analyticsGroup := api.Group("/analytics")
	{
		analyticsGroup.GET("/revenue", analytics.RevenueGenerator)
		analyticsGroup.GET("/top-products", analytics.TopSoldMedicines)
		analyticsGroup.GET("/top-categories", analytics.TopSoldCategories)
	}

	alertGroup := api.Group("/alerts")
	alertGroup.Use(middlewares.PermissionMiddleware(middlewares.PermViewAlerts))
	{
		alertGroup.GET("", alerts.GetAlertsByDate)
	}

	activityGroup := api.Group("/activity")
	{
		activityGroup.GET("", activity.GetRecentActivityLogs)
	}

	log.Println("Server starting ...")
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	err := router.Run(":" + port) // include the colon!
	if err != nil {
		log.Fatalf("Failed to start server: %s", err.Error())
	}

}

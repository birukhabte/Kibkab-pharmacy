package middlewares

import (
	"net/http"

	"github.com/gechjs/Pharmacy-App/db"
	"github.com/gechjs/Pharmacy-App/models"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// Permission constants to prevent typos
const (
	PermAdjustStock     = "adjust_stock"
	PermCreateSale      = "create_sale"
	PermApproveSale     = "approve_sale"
	PermCreateOrder     = "create_order"
	PermApproveOrder    = "approve_order"
	PermPayOrder        = "pay_order"
	PermManageEmployees = "manage_employees"
	PermManageRoles     = "manage_roles"
	PermManageBranches  = "manage_branches"
	PermManageCustomers = "manage_customer"
	PermViewAlerts      = "view_alerts"
	PermViewReports     = "view_reports"
	PermPayCommission   = "pay_commission"
)

func PermissionMiddleware(permissionName string) gin.HandlerFunc {
	return func(c *gin.Context) {
		role_id_val, ok := c.Get("role_id")
		if !ok {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "failed to read role_id for permission"})
			return
		}
		role_id, ok := role_id_val.(uuid.UUID)
		if !ok {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "failed to assert role_id for permission"})
			return
		}

		// fetch every permission associated with that role
		var permissions []models.Permission
		err := db.DB.Table("permissions").
			Select("permissions.*").
			Joins("JOIN role_permissions ON role_permissions.permission_id = permissions.id").
			Where("role_permissions.role_id = ?", role_id).
			Find(&permissions).Error

		if err != nil {
			c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch permissions"})
			return
		}

		// iterate over permissions
		for _, permission := range permissions {
			if permissionName == permission.Name {
				c.Next()
				return
			}
		}

		c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "you don't have the permission for this action"})

	}

}

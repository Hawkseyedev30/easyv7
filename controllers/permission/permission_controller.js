var {
  Admin,
  Activity_system,
  Role,
  Getdata_permissionsv1,
  RolePermission,
} = require("../../models");
const axios = require("axios");
const { to, ReE, ReS, TE } = require("../../services/util.service");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const jwt = require("jsonwebtoken");
const CONFIG = require("../../config/config.json");
var url = require("url");
const app = require("../../services/app.service");
const config = require("../../config/app.json")[app["env"]];
const Apiscb_helper = require("../../helpers/login.helpers");
//const Apiscb_helper = require("../../helpers/login.helpers");
var moment = require("moment");
require("moment/locale/th");
const agent = "Android/14;FastEasy/3.86.0/8940";
const tilesVersions = "82";
const { v4: uuidv4 } = require("uuid");
const { permission } = require("process");
function conRes(res) {
  return Object.values(JSON.parse(JSON.stringify(res)));
}
function generateUuid() {
  return uuidv4();
}


// import { SmileOutlined } from '@ant-design/icons';



const addpermission = async function (req, res) {
  try {
    const body = req.body;

    if (!body.name || !body.roleName || !body.permission) {
      let activity = await Activity_system.create({
        username: req.user.username,
        description: `${moment().locale("th").format("lll")} ${req.user.username
          } พยายามเพิ่มตำแหน่ง`,
        types: "created",
        IP: req.user.IP || "000.0.0.0",
        status: 0,
        note: `Invalid role data`,
        token: req.user.auth_token,
      });
      return ReE(res, { message: "Invalid role data" }, 400); // Use 400 Bad Request
    }

    const permissions = await Getdata_permissionsv1.findAll({
      where: { id: { [Op.in]: body.permission } },
    });

    const existingRole = await Role.findOne({ where: { name: body.name } });
    if (existingRole) {
      await existingRole.setPermissions(permissions);
      let activity = await Activity_system.create({
        username: req.user.username,
        description: `${moment().locale("th").format("lll")} ${req.user.username
          } พยายามเพิ่มตำแหน่ง`,
        types: "created",
        IP: req.user.IP || "000.0.0.0",
        status: 0,
        note: `Role name already exists`,
        token: req.user.auth_token,
      });
      return ReE(res, { message: "Role name already exists" }, 400); // Use 400 Bad Request
    }
    let d = generateUuid();

    // console.log(body)
    // Uncomment if you need to create new roles
    const role = await Role.create({
      name: body.name,
      roleName: body.roleName,
      merchantId: req.user.merchantId,
      explain: body.roleName,
      UUID: d,
    });

    // Uncomment to associate permissions with the role
    await role.setPermissions(permissions);
    let activity = await Activity_system.create({
      username: req.user.username,
      description: `${moment().locale("th").format("lll")} ${req.user.username
        } เพิ่มตำแหน่ง : name: ${body.name}, roleName: ${body.roleName} สำเร็จ`,
      types: "created",
      IP: req.user.IP || "000.0.0.0",
      status: 1,
      note: ``,
      token: req.user.auth_token,
    });
    return ReS(res, {
      data: permissions,
      success: true, // Add a success flag
      message: "success",
    });
  } catch (error) {
    console.error(error);
    return ReE(res, { message: "An error occurred" }, 500); // Use 500 Internal Server Error
  }
};

const alldata_permissions = async function (req, res) {
  try {
    let data = await Getdata_permissionsv1.findAll({});

    // console.log(data)
    return ReS(res, {
      data: data,
      success: true, // Add a success flag
      message: "success",
    });
  } catch (error) {
    console.error(error);
    return ReE(res, { message: "An error occurred" }, 500); // Use 500 Internal Server Error
  }
};
const getdatamyAdmin = async function (req, res) {
  let data = await Role.findAll({
    include: [
      {
        as: "permission",
        model: RolePermission,
        include: [
          {
            as: "permission",
            model: Getdata_permissionsv1,

            required: true,
            // where: { to_user_id: user_id, request_status: "Requested" },
          },
        ],
        attributes: {
          include: [],
          exclude: ["deleted_at"],
        },
      },
    ],
    where: {
      roleName: req.user.role,
    },
  });

  let dataretrun = {
    datauser: req.user,
    permission: data,
  };
  return ReS(res, {
    data: dataretrun,
    success: true, // Add a success flag
    message: "success",
  });
};

const create_permission = async function (req, res) {
  let body = req.body;

  // console.log(body)
  let data = await Getdata_permissionsv1.findOne({
    where: {
      name: body.name,
    },
  });

  if (!data) {
    let datas = await Getdata_permissionsv1.create(body);
    return ReS(res, {
      data: datas,
      success: true, // Add a success flag
      message: "success",
    });
  }

  return ReE(res, {
    data: data,
    success: true, // Add a success flag
    message: "มีแล้ว",
  });
};

const getalldata_Role = async function (req, res) {
  try {
    let data = await Role.findAll({
      include: [
        {
          as: "permission",
          model: RolePermission,
          include: [
            {
              as: "permission",
              model: Getdata_permissionsv1,

              required: true,
              // where: { to_user_id: user_id, request_status: "Requested" },
            },
          ],
          attributes: {
            include: [],
            exclude: ["deleted_at"],
          },
        },
      ],
    });

    const combinedData = data.map((role) => {
      let d = role.permission;
      return {
        // Role attributes
        id: role.id,
        name: role.name,
        uuid: role.UUID,
        merchantId: role.merchantId,
        name: role.name,
        roleName: role.roleName,
        //slug: role.slug,
        isPublic: false,

        // Permissions array
        permissions: role.permission,
      };
    });
    return ReS(res, {
      data: combinedData,
      success: true, // Add a success flag
      message: "success",
    });
  } catch (error) {
    // console.error(error);
    return ReE(res, { message: "An error occurred" }, 500); // Use 500 Internal Server Error
  }
};

// ******* NEW *********//
const editRolePermission = async function (req, res) {
  try {
    const body = req.body;
    let item = {
      roleId: body.roleId,
      roleName: body.roleName,
      name: body.name,
      permissionId: body.permissionId,
    };
    if (!item) {
      return ReE(res, {
        success: false, // Add a success flag
        message: "ไม่พบข้อมูล",
      });
    }
    const role = await Role.findOne({
      where: {
        id: item.roleId,
      },
    });
    const permissions = await RolePermission.findAll({
      where: {
        permissionId: {
          [Op.in]: item.permissionId,
        },
        roleId: item.roleId,
      },
    });
    if (permissions.length == 0 || !role) {
      return ReE(res, {
        success: false, // Add a success flag
        message: "ไม่พบข้อมูล",
      });
    }

    let err, updateRolePermissions, updateRoles;
    [err, updateRolePermissions] = await to(
      updateRolePermission(item, permissions)
    );
    [err, updateRoles] = await to(updateRole(item));

    if (!updateRolePermissions || !updateRoles || err) {
      return ReE(res, {
        success: false, // Add a success flag
        message: "อัพเดทข้อมูลล้มเหลว",
      });
    }
    return ReS(res, {
      success: true, // Add a success flag
      message: "อัพเดทข้อมูลสำเร็จ",
    });
  } catch (error) {
    console.error(error);
    return ReE(res, { message: "An error occurred" }, 500); // Use 500 Internal Server Error
  }
};
const editPermission = async function (req, res) {
  try {
    const body = req.body;
    let item = {
      roleId: body.roleId,
      roleName: body.roleName,
      name: body.name,
      permissionId: body?.permissionId,
    };

    if (item?.permissionId || body.isPublic) {
      let data = await Getdata_permissionsv1.findOne({
        where: {
          id: item?.permissionId,
        },
      });
      const permissions = await RolePermission.update(
        {
          isPublic: body.isPublic,
        },
        {
          where: {
            permissionId: item?.permissionId,
            roleId: item?.roleId,
          },
        }
      );
      if (permissions[0] == 0) {
        let activity = await Activity_system.create({
          username: req.user.username,
          description: `${moment().locale("th").format("lll")} ${req.user.username
            } ${body.isPublic == 0 ? "พยายามปิดการใช้งาน" : "พยายามเปิดการใช้งาน"
            } ${data?.description} สำเร็จ`,
          types: "edit",
          IP: req.user.IP || "000.0.0.0",
          status: 0,
          note: `บันทึกข้อมูลล้มเหลว`,
          token: req.user.auth_token,
        });
        return ReE(res, {
          success: false, // Add a success flag
          message: "!! เกิดข้อผิดพลาด",
        });
      }
      let activity = await Activity_system.create({
        username: req.user.username,
        description: `${moment().locale("th").format("lll")} ${req.user.username
          } ${body.isPublic == 0 ? "ปิดการใช้งาน" : "เปิดการใช้งาน"} ${data?.description
          } สำเร็จ`,
        types: "edit",
        IP: req.user.IP || "000.0.0.0",
        status: 1,
        note: ``,
        token: req.user.auth_token,
      });
      return ReS(res, {
        success: true, // Add a success flag
        message: `${body.isPublic == 0 ? "ปิดการใช้งาน" : "เปิดการใช้งาน"} ${data?.description
          }`,
      });
    } else {
      let updateRoled = await updateRole(item);
      if (!updateRoled) {
        let activity = await Activity_system.create({
          username: req.user.username,
          description: `${moment().locale("th").format("lll")} ${req.user.username
            } พยายามแก้ไขข้อมูล, Role: ${body.name}, Role: ${body.roleName}`,
          types: "edit",
          IP: req?.user?.IP || "000.0.0.0",
          status: 0,
          note: `บันทึกข้อมูลล้มเหลว`,
          token: req.user.auth_token,
        });
        return ReE(res, {
          success: true, // Add a success flag
          message: "!! เกิดข้อผิดพลาด",
        });
      }
      let activity = await Activity_system.create({
        username: req.user.username,
        description: `${moment().locale("th").format("lll")} ${req.user.username
          } แก้ไขข้อมูล, Role: ${body.name}, RoleName: ${body.roleName} สำเร็จ`,
        types: "edit",
        IP: req.user.IP || "000.0.0.0",
        status: 1,
        note: ``,
        token: req.user.auth_token,
      });
      return ReS(res, {
        success: true, // Add a success flag
        message: "อัพเดทข้อมูลสำเร็จ",
      });
    }
  } catch (error) {
    console.error(error);
    return ReE(res, { message: "An error occurred" }, 500); // Use 500 Internal Server Error
  }
};
async function updateRolePermission(data, permissions) {
  if (!data) {
    return false;
  }
  for (item of permissions) {
    const rolePermissionUpdate = await RolePermission.update(
      {
        isPublic: item.isPublic == 1 ? 0 : 1,
      },
      {
        where: {
          permissionId: {
            [Op.in]: data.permissionId,
          },
          roleId: data.roleId,
        },
      }
    );

    //console.log(rolePermissionUpdate[0]);
    if (rolePermissionUpdate[0] == 0) {
      return false;
    }
    return true;
  }
  return false;
}
async function updateRole(data) {
  if (!data) {
    return false;
  }

  const roleUpdate = await Role.update(
    {
      name: data.name,
      roleName: data.roleName,
      explain: data.roleName,
    },
    {
      where: {
        id: data.roleId,
      },
    }
  );
  if (roleUpdate[0] == 0) {
    return false;
  }
  return true;
}

//
const postEditAdmin = async function (req, res) {
  try {
    const body = req.body;
    let item = {
      roleID: body.roleID,
      admin_status: body.admin_status,
    };
    let err, user, role, update;
    [err, user] = await to(
      Admin.findOne({
        where: {
          id: body.uuid,
        },
      })
    );
    [err, role] = await to(Role.findOne({ where: { id: body.roleID } }));
    if (err || !user || !role) {
      return ReE(res, {
        success: false, // Add a success flag
        message: !err.message || "ไม่พบข้อมูล",
      });
    }
    if (user?.admin_status != 1) {
      let activity = await Activity_system.create({
        username: req.user.username,
        description: `${moment().locale("th").format("lll")} ${req.user.id == body.uuid
          ? `${req.user.username} พยายามแก้ไขข้อมูล`
          : `${req.user.username} พยายามแก้ไขข้อมูลของ ${user.username}`
          }  `,
        types: "edit",
        IP: req.user.IP || "000.0.0.0",
        status: 0,
        note: `บัญชี ${user.username} ถูกระงับ`,
        token: req.user.auth_token,
      });
      return ReE(
        res,
        {
          message: `บัญชี ${user.username} ถูกระงับ`,
          status_code: 400,
        },
        200
      );
    }
    [err, update] = await to(
      Admin.update(
        {
          roleID: item.roleID,
          role: role.name,
          admin_status: item.admin_status,
        },
        {
          where: {
            id: body.uuid,
          },
        }
      )
    );
    if (err || update[0] == 0) {
      return ReE(res, {
        success: false, // Add a success flag
        message: !err.message,
      });
    }
    let activity = await Activity_system.create({
      username: req.user.username,
      description: `${moment().locale("th").format("lll")} ${req.user.id == body.uuid
        ? `${req.user.username} แก้ไขข้อมูลตัวเองสำเร็จ`
        : `${req.user.username} แก้ไขข้อมูลของ ${user.username} สำเร็จ`
        }  `,
      types: "edit",
      IP: req.user.IP || "000.0.0.0",
      status: 1,
      note: "",
      token: req.user.auth_token,
    });
    return ReS(res, {
      success: true, // Add a success flag
      message: "อัพเดทข้อมูลสำเร็จ",
    });
    //console.log(role);
  } catch (error) {
    return ReE(res, { message: "An error occurred" }, 500); // Use 500 Internal Server Error
  }
};



const role_menu = async function (req, res) {


  const dataretun =
    [
      {
        key: "1",
        icon: "DashboardOutlined",
        labelKey: "dashboard",
        path: "/dashboard",
        AuthorizedRole: [
          "SuperOwner",
          "Finance",
          "Administrators",
          "Subowner",
          "Owner",
        ],
        access: ["dashboard_view"],
      },
      {
        key: "2",
        icon: "TeamOutlined",
        labelKey: "Customer's",
        AuthorizedRole: ["SuperOwner", "Administrators", "Subowner", "Owner"],
        access: ["customer_account_view"],
        children: [
          {
            key: "21",
            labelKey: "Customer account",
            path: "/bank-bank-customer",
            permission: ["customer_account_view"],
          },
        ],
      },
      {
        key: "3",
        icon: "PlusOutlined",
        labelKey: "deposit",
        AuthorizedRole: ["SuperOwner", "Finance", "Subowner", "Owner"],
        access: ["deposit_customer_transactions_view", "feePayIn_view"],
        children: [
          {
            key: "31",
            labelKey: "Customer transactions",
            path: "/deposit-transaction",
            permission: ["deposit_customer_transactions_view"],
          },
          {
            key: "32",
            labelKey: "Fee Pay In",
            path: "/feePayIn",
            permission: ["feePayIn_view"],
          },
        ],
      },
      {
        key: "4",
        icon: "MinusOutlined",
        labelKey: "withdraw",
        AuthorizedRole: ["SuperOwner", "Finance", "Subowner", "Owner"],
        access: ["withdraw_customer_transactions_view", "feePayOut_view"],
        children: [
          {
            key: "41",
            labelKey: "Customer transactions",
            path: "/withdraw-transaction",
            permission: ["withdraw_customer_transactions_view"],
          },
          {
            key: "42",
            labelKey: "Fee Pay Out",
            path: "/feePayOut",
            permission: ["feePayOut_view"],
          },
        ],
      },
      {
        key: "5",
        icon: "HistoryOutlined",
        labelKey: "Bank account",
        AuthorizedRole: ["SuperOwner", "Subowner", "Owner"],
        access: ["bankAccount_view", "merchant_transfer_view", "statement_view"],
        children: [
          {
            key: "51",
            labelKey: "Manage account",
            path: "/bank-account",
            permission: ["bankAccount_view"],
          },
          {
            key: "52",
            labelKey: "Money transfer",
            path: "/client-transfer",
            permission: ["merchant_transfer_view"],
          },
          {
            key: "53",
            labelKey: "statement",
            path: "/statement",
            permission: ["statement_view"],
          },


        ],
      },
      {
        key: "6",
        icon: "BankOutlined",
        labelKey: "manage merchant",
        path: "/manage-merchant",
        AuthorizedRole: ["SuperOwner", "Subowner", "Owner"],
        access: ["manage_merchant_view"],
      },
      {
        key: "7",
        icon: "CheckTheSlip",
        labelKey: "CheckTheSlip",
        AuthorizedRole: ["SuperOwner", "Subowner", "Owner", "Finance"],
        access: ["auto_slip_check_with_Qr", "check_slip_without_Qr"],
        children: [
          {
            key: "71",
            labelKey: "autoSlipCheckWithQr",
            path: "/autoSlipCheckWithQr",
            permission: ["auto_slip_check_with_Qr"],
          },
          {
            key: "72",
            labelKey: "checkSlipWithOutQr",
            path: "/checkSlipWithOutQr",
            permission: ["check_slip_without_Qr"],
          },
        ],
      },
      {
        key: "8",
        icon: "UserOutlined",
        labelKey: "user",
        AuthorizedRole: ["SuperOwner", "Subowner", "Owner"],
        access: ["manage_user_view", "activity_user_view", "role_view"],
        children: [
          {
            key: "81",
            labelKey: "manage user",
            path: "/user",
            permission: ["manage_user_view"],
          },
          {
            key: "83",
            labelKey: "Role",
            path: "/role",
            permission: ["role_view"],
          },
          {
            key: "82",
            labelKey: "activity",
            path: "/user-activity",
            permission: ["activity_user_view"],
          },
        ],
      },
      {
    key: "12",
    icon: "InvoicesOutlined",
    labelKey: "Invoices",
    path: "/invoices",
    AuthorizedRole: [
      "SuperOwner",
      "Subowner",
    ],
    access: ["invoices_view"],
  },
       {
        key: "11",
        icon: "ReportOutlined",
        labelKey: "report",
        AuthorizedRole: ["SuperOwner", "Subowner", "Owner"],
        access: ["chart_report_view"],
        children: [
          {
            key: "111",
            labelKey: "chart report",
            path: "/chart-report",
            permission: ["chart_report_view"],
          },
        ],
      },
      {
        key: "9",
        icon: "SettingOutlined",
        labelKey: "setting",
        path: "/setting",
        AuthorizedRole: ["SuperOwner", "Subowner", "Owner"],
        access: ["setting_view"],
      },
      {
        key: "10",
        icon: "FileTextOutlined",
        labelKey: "api documentation",
        path: null,
        AuthorizedRole: [
          "SuperOwner",
          "Finance",
          "Administrators",
          "Subowner",
          "Owner",
        ],
        access: ["ApiDocumentation_view"],
      },
     
    ]


  return ReS(res, {
    data: dataretun, // Add a success flag
    message: "อัพเดทข้อมูลสำเร็จ",
  });







}
const deleteRole = async function (req, res) {

  const { roleId } = req.params;


  const role = await Role.findOne({
    where: { id: roleId },
  });

  if (!role) {
    return ReE(res, { message: "Role not found" }, 404);
  }

  await RolePermission.destroy({ where: { roleId: roleId } });
  await role.destroy();

  await Activity_system.create({
    username: req.user.username,
    description: `${moment().locale("th").format("lll")} ${req.user.username} deleted role: ${role.name} (ID: ${roleId})`,
    types: "delete",
    IP: req.user.IP || "000.0.0.0",
    status: 1,
    note: `Role '${role.name}' deleted successfully.`,
    token: req.user.auth_token,
  });
  return ReS(res, { message: `Role '${role.name}' deleted successfully.` }, 200);
}


const role_permissions = async function (req, res) {

  try {
    let dataRole = await Role.findAll({
      include: [
        {
          as: "permission",
          model: RolePermission,
          include: [
            {
              as: "permission",
              model: Getdata_permissionsv1,
              required: true,
            },
          ],
          attributes: {
            exclude: ["deleted_at"],
          },
        },
      ],
    });

    const transformedData = dataRole.map((role) => {
      const roleJSON = role.toJSON();
      if (roleJSON.permission) {
        roleJSON.permission = roleJSON.permission.map((rolePerm) => {
          const { permission, ...restOfRolePerm } = rolePerm;
          const { id, ...permissionDetails } = permission; // Exclude id from the nested permission object
          return { ...restOfRolePerm, ...permissionDetails };
        });
      }
      return roleJSON;
    });

    return ReS(res, {
      data: transformedData,
      message: "Successfully",
    });
  } catch (error) {
    console.error(error);
    return ReE(res, { message: "An error occurred" }, 500);
  }
}

const postalternateAdmin = async function (req, res) {



  const body = req.body;


  if (!body.Active_merchantId) {

    return ReE(res, { message: "Active_merchantId error occurred" }, 500);

  }


  const permissions = await Admin.update(
    {
      Active_merchantId: body.Active_merchantId,
      merchantId: body.Active_merchantId
    },
    {
      where: {

        id: req.user.id,
      },
    }
  );


  return ReS(res, {
    data: permissions,
    message: "Successfully",
  });


}

module.exports = {
  addpermission,
  getalldata_Role,
  alldata_permissions,
  getdatamyAdmin,
  create_permission,
  editRolePermission,
  editPermission,
  postEditAdmin,
  role_permissions,
  role_menu,
  deleteRole,
  postalternateAdmin
};

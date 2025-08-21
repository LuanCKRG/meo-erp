# Ideas

- [X] Sidebar footer Suport and feedback
- [X] Sidebar Logout
- [ ] Configurar o admin para setar as permissões para roles e users



# Permissions
- admin:dashboard:view
- admin:data:manage
- admin:settings:manage

## Admin

### Data
- admin:data:create
- admin:data:delete
- admin:data:edit
- admin:data:view

### Settings
- admin:settings:edit
- admin:settings:view

### Users
- admin:users:manage
- admin:users:view

### Permissions
- admin:permissions:manage

## Partners
- partners:manage
- partners:view

## Sellers
- sellers:manage
- sellers:view

## Simulations
- simulations:create

## Reports
- reports:view

---


## Permissions (permissions_seed.csv)
id,description
admin:dashboard:view,"Permite visualizar o painel principal da área de administração."
admin:data:manage,"Permite gerenciar dados globais do sistema, como equipamentos, marcas e tipos de estrutura."
admin:data:view,"Can view the data management page for equipments, brands, and structure types."
admin:settings:manage,"Can edit general settings like interest rates."
admin:settings:view,"Can view the general settings page."
admin:users:manage,"Can manage users and their permissions."
admin:users:view,"Can view the user management page."
admin:permissions:manage,"Permite visualizar e editar as permissões de cada função de usuário no sistema."
partners:manage,"Can manage partners (approve, reject, edit)."
partners:view,"Can view the partners list."
reports:view,"Can view reports."
sellers:manage,"Can manage sellers."
sellers:view,"Can view the sellers list."
simulations:create,"Can create new simulations."

export default (sequelize, DataTypes) => {

    const Notifications = sequelize.define('Notifications', {
        id: {
            allowNull: false,
            primaryKey: true,
            type: DataTypes.INTEGER,
            autoIncrement: true,
        },
        email: {
            type: DataTypes.STRING(70),
            allowNull: true,
            defaultValue: ""
        },
        newsletter: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        securityNotifications: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        securityNotificationsChanel: {
            type: DataTypes.STRING(70),
            allowNull: true,
            defaultValue: ""
        },
        newsletterChanel: {
            type: DataTypes.STRING(70),
            allowNull: true,
            defaultValue: ""
        },
        user_id: {
            type: DataTypes.INTEGER,
            unique: true
        },
    },
    {
        tableName: 'notifications',
        timestamps: true,
        underscored: true,
    });

    Notifications.associate = function (models) {
        Notifications.belongsTo(models.User);
    };

    return Notifications;

};
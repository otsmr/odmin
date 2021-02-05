export default (sequelize, DataTypes) => {

    const Service = sequelize.define('Service', {
        id: {
            allowNull: false,
            primaryKey: true,
            type: DataTypes.INTEGER,
            autoIncrement: true,
        },
        name: {
            type: DataTypes.STRING(160),
            allowNull: false,
            unique: true
        },
        serviceID: {
            type: DataTypes.STRING(10),
            allowNull: false,
            unique: true
        },
        homepage: {
            type: DataTypes.TEXT
        },
        returnto: {
            type: DataTypes.TEXT
        }
    },
    {
        tableName: 'service',
        timestamps: true,
        underscored: true,
    });

    Service.associate = function (models) {
        Service.belongsTo(models.User, { foreignKey: 'user_id' });
    };

    return Service;

};
export default (sequelize, DataTypes) => {

    const Token = sequelize.define('Token', {
        id: {
            allowNull: false,
            primaryKey: true,
            type: DataTypes.INTEGER,
            autoIncrement: true,
        },
        name: {
            type: DataTypes.STRING(20)
        },
        token: {
            type: DataTypes.STRING(64),
            allowNull: false
        }
    }, 
    {
        tableName: 'token',
        timestamps: true,
        underscored: true,
    });  

    return Token;

};

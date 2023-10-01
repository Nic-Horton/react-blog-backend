'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
	class Blog extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
		static associate(models) {
			// define association here
			Blog.belongsTo(models.User, {
				foreignKey: 'user_id',
				onDelete: 'CASCADE',
			});
		}
	}
	Blog.init(
		{
			title: DataTypes.STRING,
			content: DataTypes.TEXT,
			user_id: DataTypes.INTEGER,
		},
		{
			sequelize,
			modelName: 'Blog',
		}
	);
	return Blog;
};

const db = require('../models');
const { businessDoc: BusinessDoc } = db;
const itemController = require('./item/item.controller');

const configKey = 'BUSINESS_DOC';

exports.getAll = (req, res) => {
  itemController.itemGetAll(req, res, BusinessDoc, configKey);
};

exports.get = (req, res) => {
  itemController.itemGet(req, res, BusinessDoc, configKey);
};

exports.create = (req, res) => {
  itemController.itemCreate(req, res, BusinessDoc, configKey);
};

exports.update = (req, res) => {
  itemController.itemUpdate(req, res, BusinessDoc, configKey);
};

exports.delete = (req, res) => {
  itemController.itemDelete(req, res, BusinessDoc, configKey);
};

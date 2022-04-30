const db = require('../models');
const { staff: Staff } = db;
const itemController = require('./item/item.controller');

const configKey = 'STAFF';

// jjw; TODO: here???!!! put this into staff.controller
exports.staffGetAll = (req, res) => {
  itemController.itemGetAll(req, res, Staff, configKey);
};

exports.staffGet = (req, res) => {
  itemController.itemGet(req, res, Staff, configKey);
};

exports.staffCreate = (req, res) => {
  itemController.itemCreate(req, res, Staff, configKey);
};

exports.staffUpdate = (req, res) => {
  itemController.itemUpdate(req, res, Staff, configKey);
};

exports.staffDelete = (req, res) => {
  itemController.itemDelete(req, res, Staff, configKey);
};

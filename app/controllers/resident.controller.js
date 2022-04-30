const db = require('../models');
const { resident: Resident } = db;
const itemController = require('./item/item.controller');

const configKey = 'RESIDENT';

// jjw; TODO: here???!!! put this into resident.controller
exports.residentGetAll = (req, res) => {
  itemController.itemGetAll(req, res, Resident, configKey);
};

exports.residentGet = (req, res) => {
  itemController.itemGet(req, res, Resident, configKey);
};

exports.residentCreate = (req, res) => {
  itemController.itemCreate(req, res, Resident, configKey);
};

exports.residentUpdate = (req, res) => {
  itemController.itemUpdate(req, res, Resident, configKey);
};

exports.residentDelete = (req, res) => {
  itemController.itemDelete(req, res, Resident, configKey);
};

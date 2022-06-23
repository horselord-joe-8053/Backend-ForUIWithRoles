const db = require('../models');
const { contact: Contact } = db;
const itemController = require('./item/item.controller');

const configKey = 'CONTACT';

exports.contactGetAll = (req, res) => {
  itemController.itemGetAll(req, res, Contact, configKey);
};

exports.contactGet = (req, res) => {
  itemController.itemGet(req, res, Contact, configKey);
};

exports.contactCreate = (req, res) => {
  itemController.itemCreate(req, res, Contact, configKey);
};

exports.contactUpdate = (req, res) => {
  itemController.itemUpdate(req, res, Contact, configKey);
};

exports.contactDelete = (req, res) => {
  itemController.itemDelete(req, res, Contact, configKey);
};

const db = require('../models');
const { linkedVideo: LinkedVideo } = db;
const itemController = require('./item/item.controller');

const configKey = 'LINKED_VIDEO';

exports.linkedVideoGetAll = (req, res) => {
  itemController.itemGetAll(req, res, LinkedVideo, configKey);
};

exports.linkedVideoGet = (req, res) => {
  itemController.itemGet(req, res, LinkedVideo, configKey);
};

exports.linkedVideoCreate = (req, res) => {
  itemController.itemCreate(req, res, LinkedVideo, configKey);
};

exports.linkedVideoUpdate = (req, res) => {
  itemController.itemUpdate(req, res, LinkedVideo, configKey);
};

exports.linkedVideoDelete = (req, res) => {
  itemController.itemDelete(req, res, LinkedVideo, configKey);
};

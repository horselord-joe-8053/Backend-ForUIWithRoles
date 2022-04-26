const db = require('../models');
// const { resident: Resident } = db;

exports.allAccess = (req, res) => {
  res.status(200).send('Public Content.');
};

exports.currUserBoard = (req, res) => {
  res.status(200).send('Current User Content.');
};

exports.staffBoard = (req, res) => {
  res.status(200).send('Staff Content.');
};

exports.ownerBoard = (req, res) => {
  res.status(200).send('Owner Content.');
};

exports.adminBoard = (req, res) => {
  res.status(200).send('Admin Content.');
};

const mongoose = require('mongoose');

// jjw: TODO: how to do mongoose schema and model properly
// jjw: https://stackoverflow.com/a/39871456
// jjw: https://mongoosejs.com/docs/2.7.x/docs/schematypes.html

// jjw: TODO: maybe generate from config files entirely?
// jjw:   Problem: 'String' 'Date' below are mongoose Schema dataType classes
// jjw:   Solution: given the limited mongoose Schema datatype (https://mongoosejs.com/docs/schematypes.html)
// jjw:     and limited datatype we need to use for we can do a simple look up here in the backend
const Resident = mongoose.model(
  'Resident',
  new mongoose.Schema({
    // general info
    firstName: String,
    lastName: String,
    sex: {
      type: String,
      enum: ['Male', 'Female'],
    },
    room: String,
    dob: Date,
    admissionDate: Date,
    pocketMoneyAmount: Number,

    // payment info
    pensionCardNumber: String,

    payMethod: {
      type: String,
      enum: ['CommBank', 'Cheque', 'Cash'],
      // default: 'CommBank',
    },
    payToBankAccount: {
      type: String,
      enum: ['None', '063-301 00000000'],
      // default: '063-301 10206191',
    },
    notesForPayment: String,
    payer: {
      type: String,
      enum: ['State Trustee', 'Centrelink', 'Relative or Guardian', 'Self'],
      // default: 'State Trustee',
    },
    notesForPayer: String,

    payFrequency: {
      type: String,
      enum: ['Fortnightly', 'Monthly', 'Every 4 Weeks'],
      // jjw: TODO: ENUM change enum <option value="".../> to be consistent with the text it shows
      // jjw:   so that when it shows in the summary list, it will look consistent.
      // jjw:   apparently, these values can have space
      default: 'Fortnightly',
    },
    paymentAmount: Number,
    lastKnownPayDate: Date,
    paidDateList: [Date],
    lastDateOfIncrease: Date,
    prevPaymentAmount: Number,

    // medical info
    medicareNumber: String, //jjw: TODO: ideally boolean but frontend is using 'yes', 'no', the conversion has to happen somewhere in expense of generality
    diabeticStatus: {
      type: String,
      enum: ['None', 'Type I', 'Type II'],
      // jjw: TODO: ENUM change enum <option value="".../> to be consistent with the text it shows
      // jjw:   so that when it shows in the summary list, it will look consistent.
      // jjw:   apparently, these values can have space
      default: 'None',
    },
    medicalSummary: String,
    gpName: String,
    gpPrimaryPhone: String,
    gpSecondaryPhone: String,
    gpEmail: String,
    gpClinicName: String,
    gpAddress: String,

    // contact info
    nextOfKinName: String,
    nextOfKinRelationship: String,
    nextOfKinPrimaryPhone: String,
    nextOfKinSecondaryPhone: String,
    nextOfKinEmail: String,

    primaryProContactName: String,
    // jjw: TODO: ENUM need primaryProContactRole and secondaryProContactRole in a enum
    primaryProContactOrg: String,
    primaryProContactRole: String,
    primaryProPrimaryPhone: String,
    primaryProSecondaryPhone: String,
    primaryProContactEmail: String,

    secondaryProContactName: String,
    // jjw: TODO: ENUM need primaryProContactRole and secondaryProContactRole in a enum
    secondaryProContactOrg: String,
    secondaryProContactRole: String,
    secondaryProPrimaryPhone: String,
    secondaryProSecondaryPhone: String,
    secondaryProContactEmail: String,

    residentCarePlanFileLink: String,
    residentFileFolderLink: String,

    // unpaidDateList: {type: Array, "default": []},
  })
);

module.exports = Resident;

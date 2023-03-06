
const setRoleRules = {
  id: 'required',
  role: {
    rules: 'belongsto',
    belongsto: [
      'admin',
      'super admin',
      'account_rel_manager',
      'branch_op_manager',
      'branch_manager',
      'internal_control',
      'head_office',
    ],
  },
};

const registerRules = [
  {
    field: 'firstname',
    rules: 'required',
  },
  {
    field: 'lastname',
    rules: 'required',
  },
  {
    field: 'email',
    rules: 'required|email|unique',
    unique: 'User',
    messages: {
      required: 'Email address is required.',
      email: 'A valid email address is required.',
      unique: 'Email address already exists.',
    },
  },
  {
    field: 'password',
    rules: 'required|minlen',
    minlen: 8,
  },
  {
    field: 'role',
    rules: 'belongsto',
    belongsto: [
      'admin',
      'super admin',
      'customer',
      'freelancer',
     
    ],
  },
];

const resetPasswordRules = [
  {
    field: 'email',
    rules: 'required',
  },
];

const changePasswordRules = [
  {
    field: 'password',
    rules: 'required|minlen',
    minlen: 8,
  },
];

const loginRules = [
  {
    field: 'email',
    rules: 'required',
    messages: {
      required: 'Email address or Merchant ID is required.',
    },
  },
  {
    field: 'password',
    rules: 'required',
  },
];

const questionRules = [
  {
    field: 'email',
    rules: 'required',
    messages: {
      required: 'Email address or Merchant ID is required.',
    },
  },
  {
    field: 'password',
    rules: 'required',
  },
  {
    field: 'question',
    rules: 'required',
  },
];


const socialRules = [
  {
    field: 'email',
    rules: 'required',
    messages: {
      required: 'email is required.',
    },
  },
  {
    field: 'title',
    rules: 'required',
    messages: {
      required: 'title is required.',
    },
  },
  {
    field: 'password',
    rules: 'required',
  },

];

const clockingRules = [
  {
    field: 'site_name',
    rules: 'required',
  },
  {
    field: 'clocking_date_time',
    rules: 'required',
  },

  {
    field: 'clocking_purpose',
    rules: 'required',
  },
];

const setEmailRules = [
  {
    field: 'email',
    rules: 'required',
  },
];

const setLocationRules = [
  {
    field: 'name',
    rules: 'required',
  },
];

export {
  socialRules, questionRules, registerRules, loginRules, resetPasswordRules, setEmailRules, changePasswordRules,  setRoleRules, clockingRules, setLocationRules
};

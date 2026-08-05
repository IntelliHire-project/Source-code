export const ROLE_HOME = {
  candidate: '/candidate/dashboard',
  recruiter: '/recruiter/dashboard',
  admin: '/admin/dashboard',
};

export const roleHomePath = (role) => ROLE_HOME[role] || '/dashboard';

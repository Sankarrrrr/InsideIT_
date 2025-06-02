const adminEmails = ["admin@example.com", "jrikcitrin@gmail.com"]; // сюда добавляешь почты админов

export const isAdmin = (user) => {
  if (!user) return false;
  return adminEmails.includes(user.email);
};

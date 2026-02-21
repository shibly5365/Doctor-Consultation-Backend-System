const baseUrl = process.env.API_BASE_URL || "http://localhost:5000";
const now = Date.now();

const adminEmail = process.env.ADMIN_EMAIL;
const adminPassword = process.env.ADMIN_PASSWORD;

const userPayload = {
  name: "Demo User",
  email: `demo.user.${now}@example.com`,
  password: "DemoUser@123",
};

const doctorPayload = {
  name: "Demo Doctor",
  email: `demo.doctor.${now}@example.com`,
  password: "DemoDoctor@123",
  specialization: "General Medicine",
  consultationFee: 500,
};

const request = async (method, path, { token, body } = {}) => {
  const res = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(
      `${method} ${path} failed (${res.status}): ${data.message || "Unknown error"}`,
    );
  }
  return data;
};

const printStep = (title, value) => {
  console.log(`\n[${title}]`);
  if (value !== undefined) {
    console.log(value);
  }
};

const run = async () => {
  if (!adminEmail || !adminPassword) {
    throw new Error(
      "Set ADMIN_EMAIL and ADMIN_PASSWORD env vars for existing admin account",
    );
  }

  printStep("BASE_URL", baseUrl);

  const doctorReg = await request("POST", "/api/auth/doctors/register", {
    body: doctorPayload,
  });
  const doctorId = doctorReg.data.doctor._id;
  const doctorToken = doctorReg.data.token;
  printStep("DOCTOR_REGISTERED", { doctorId, email: doctorPayload.email });

  const userReg = await request("POST", "/api/auth/users/register", {
    body: userPayload,
  });
  const userToken = userReg.data.token;
  printStep("USER_REGISTERED", { userId: userReg.data.user.id, email: userPayload.email });

  const adminLogin = await request("POST", "/api/auth/admin/login", {
    body: { email: adminEmail, password: adminPassword },
  });
  const adminToken = adminLogin.data.token;
  printStep("ADMIN_LOGGED_IN", { adminId: adminLogin.data.user.id, email: adminEmail });

  await request("PATCH", `/api/admin/doctors/${doctorId}/approve`, {
    token: adminToken,
    body: { isApproved: true },
  });
  printStep("DOCTOR_APPROVED", doctorId);

  await request("PATCH", "/api/doctors/availability", {
    token: doctorToken,
    body: { isOnline: true },
  });
  printStep("DOCTOR_ONLINE", true);

  const booking = await request("POST", "/api/bookings", {
    token: userToken,
    body: { doctorId },
  });
  const bookingId = booking.data._id;
  printStep("BOOKING_CREATED", bookingId);

  await request("PATCH", `/api/bookings/${bookingId}/start`, {
    token: doctorToken,
  });
  printStep("SESSION_STARTED", bookingId);

  await request("POST", `/api/bookings/${bookingId}/messages`, {
    token: userToken,
    body: { content: "Hello doctor, I need consultation." },
  });
  await request("POST", `/api/bookings/${bookingId}/messages`, {
    token: doctorToken,
    body: { content: "Sure, please tell me your symptoms." },
  });
  const messages = await request("GET", `/api/bookings/${bookingId}/messages`, {
    token: userToken,
  });
  printStep("MESSAGES_COUNT", messages.data.length);

  const ended = await request("PATCH", `/api/bookings/${bookingId}/end`, {
    token: doctorToken,
  });
  printStep("SESSION_ENDED", {
    durationMinutes: ended.data.durationMinutes,
    totalAmount: ended.data.totalAmount,
    doctorEarning: ended.data.doctorEarning,
  });

  const transactions = await request("GET", "/api/admin/transactions", {
    token: adminToken,
  });
  printStep("TRANSACTIONS_COUNT", transactions.data.length);

  console.log("\nDEMO FLOW COMPLETED SUCCESSFULLY");
};

run().catch((error) => {
  console.error("\nDEMO FLOW FAILED");
  console.error(error.message);
  process.exit(1);
});

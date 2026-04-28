import axios from "axios";
import { API_BASE_URL } from "../../api/getApiURL";

export const createMetaCtUser = async (
  wallet,
  referral = "",
  setUser,
  setLoading,
) => {
  try {
    setLoading(true);

    const alreadyVerified =
      sessionStorage.getItem("passcode_verified") === "true";

    // ── Step 1: Try to get existing user ──────────────────────
    let existingUser = null;
    try {
      const response = await axios.get(
        `${API_BASE_URL}/users/wallet/${wallet}`,
      );
      existingUser = response.data;
      console.log("[createMetaCtUser] existingUser:", existingUser);
      console.log(
        "[createMetaCtUser] passcode_set:",
        existingUser?.passcode_set,
      );
    } catch (error) {
      if (error.response?.status !== 404) {
        setLoading(false);
        throw error;
      }
    }

    // ── Step 2: Existing user ─────────────────────────────────
    if (existingUser?.uuid) {
      if (alreadyVerified) {
        setUser(existingUser);
        setLoading(false);
        console.log("[createMetaCtUser] already verified this session");
        return { exists: true, has_passcode: true, verified: true };
      }

      const hasPasscode = existingUser.passcode_set === true;
      console.log("[createMetaCtUser] hasPasscode:", hasPasscode);

      setLoading(false);
      return {
        exists: true,
        has_passcode: hasPasscode,
        verified: false,
        user: existingUser,
      };
    }

    // ── Step 3: New user — create ─────────────────────────────
    let newUser = null;
    try {
      const newUserResponse = await axios.post(`${API_BASE_URL}/users/create`, {
        user_wallet: wallet,
        referral_uuid: referral || null,
      });
      newUser = newUserResponse.data;
      console.log("[createMetaCtUser] new user created:", newUser);
    } catch (createError) {
      if (createError.response?.status === 400) {
        try {
          const retryRes = await axios.get(
            `${API_BASE_URL}/users/wallet/${wallet}`,
          );
          const retryUser = retryRes.data;
          const hasPasscode = retryUser.passcode_set === true;
          console.log(
            "[createMetaCtUser] retry user:",
            retryUser,
            "hasPasscode:",
            hasPasscode,
          );
          setLoading(false);
          return {
            exists: true,
            has_passcode: hasPasscode,
            verified: false,
            user: retryUser,
          };
        } catch {
          setLoading(false);
          throw createError;
        }
      }
      setLoading(false);
      throw createError;
    }

    if (!newUser?.uuid) {
      setLoading(false);
      throw new Error("User creation failed");
    }

    setLoading(false);
    return {
      exists: false,
      has_passcode: false,
      verified: false,
      user: newUser,
    };
  } catch (error) {
    console.error("[createMetaCtUser] error:", error);
    setLoading(false);
    throw error;
  }
};

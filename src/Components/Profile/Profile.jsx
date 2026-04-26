import React, { useEffect, useState } from "react";
import Header from "../Header/Header";
import { useUser } from "../../context/UserContext";
import axios from "axios";
import { API_BASE_URL } from "../../api/getApiURL";
import toast from "react-hot-toast";

const Profile = (props) => {
  const { user, setLoading } = useUser();
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");

  useEffect(() => {
    setEmail(user?.email);
    setName(user?.name);
  }, [user]);
  const handleName = (e) => {
    const { value } = e.target;
    setName(value);
  };
  const handleEmail = (e) => {
    const { value } = e.target;
    setEmail(value);
  };
  const handleSubmit = async () => {
    setLoading(true);
    if (user?.id) {
      setLoading(true);
      try {
        const res = await axios.put(`${API_BASE_URL}/users/${user?.id}`, {
          name: name,
          email: email,
        });
        toast.success(res?.data?.message);
        setLoading(false);
      } catch (err) {
        console.log(err);
        setLoading(false);
      } finally {
        setLoading(false);
      }
    }
  };
  return (
    <div className="main">
      <div className="profile">
        <Header pageTitle={"Profile"} />
        <div id="profile-edit">
          <div className="main_container">
            <div className="main_content">
              <div className="title title-profile">
                <div className="left">
                  <span className="left_icon"></span>
                  <span>Edit Profile</span>
                </div>
              </div>

              <div className="input_content ff_NunitoSemiBold">
                <div className="address">
                  <label>UID</label>
                  <input
                    type="text"
                    disabled
                    readOnly
                    value={user?.uuid || ""}
                    className="address_input"
                  />
                </div>
                <div className="address">
                  <label>Full Name</label>
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={handleName}
                    placeholder="Full Name"
                    className="address_input"
                  />
                </div>
                <div className="address">
                  <label>Email Address</label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={handleEmail}
                    placeholder="Email Address"
                    className="address_input"
                  />
                </div>
                <div className="address">
                  <label>Referral UID</label>
                  <input
                    type="text"
                    disabled
                    readOnly
                    value={user?.referral_uuid || ""}
                    className="address_input"
                  />
                </div>
                <div className="address">
                  <label>Wallet Address</label>
                  <input
                    type="text"
                    disabled
                    readOnly
                    value={props?.walletId || ""}
                    className="address_input"
                  />
                </div>
              </div>
              <div className="flex justify-center">
                <button
                  onClick={handleSubmit}
                  type="button"
                  className="send_action fs-16 ff_NunitoBold"
                >
                  Send now
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

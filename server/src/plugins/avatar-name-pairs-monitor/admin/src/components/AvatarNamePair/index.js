import React from "react";
import { useIntl } from "react-intl";
import { Stack, FieldLabel, Avatar } from "@strapi/design-system";

const AvatarNamePair = ({ intlLabel, value }) => {
  const { formatMessage } = useIntl();
  const avatarNamePairs = value ? JSON.parse(value) : [];
  return (
    <Stack spacing={1}>
      <FieldLabel>{intlLabel ? formatMessage(intlLabel) : ""}</FieldLabel>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "10px",
          marginTop: "10px",
        }}
      >
        {avatarNamePairs.map((pair, index) => (
          <div key={index} style={{ width: "100px", overflow: "hidden" }}>
            <Avatar src={pair.avatar} alt={pair.name} />
            <div style={{ color: "white" }}>{pair.name}</div>
          </div>
        ))}
      </div>
    </Stack>
  );
};

export default AvatarNamePair;

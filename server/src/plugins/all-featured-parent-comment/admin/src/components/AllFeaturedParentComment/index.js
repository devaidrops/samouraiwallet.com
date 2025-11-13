import React, { useEffect, useState } from "react";
import { useIntl } from "react-intl";
import { Stack, SingleSelect, SingleSelectOption } from "@strapi/design-system";

const AllFeaturedParentComment = ({ intlLabel, name, onChange, value }) => {
  const { formatMessage } = useIntl();
  const [featuredParentComments, setFeaturedParentComments] = useState([]);

  useEffect(() => {
    const fetchFeaturedParentComments = async () => {
      const response = await fetch(
        "/strapi/api/comments?filters[featured][$eq]=true&filters[parent_comment][$null]=true"
      );
      const data = await response.json();
      setFeaturedParentComments(data.data);
    };

    fetchFeaturedParentComments();
  }, []);

  const handleChange = (e) => {
    onChange({
      target: {
        name,
        value: e,
      },
    });
  };

  return (
    <Stack spacing={1}>
      <SingleSelect
        value={value}
        onValueChange={handleChange}
        label={intlLabel ? formatMessage(intlLabel) : ""}
        placeholder="Select threaded comment"
      >
        {featuredParentComments?.map((comment) => (
          <SingleSelectOption key={comment.id} value={comment.id}>
            {comment.attributes.name ?? "unknown"} -{" "}
            {comment.attributes.text.slice(0, 50)}
          </SingleSelectOption>
        ))}
      </SingleSelect>
    </Stack>
  );
};

export default AllFeaturedParentComment;

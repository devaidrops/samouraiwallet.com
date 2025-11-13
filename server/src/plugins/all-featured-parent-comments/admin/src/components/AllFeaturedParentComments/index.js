import React, { useEffect, useState } from "react";
import { useIntl } from "react-intl";
import { Stack, MultiSelect, MultiSelectOption } from "@strapi/design-system";

const AllFeaturedParentComments = ({ intlLabel, name, onChange, value }) => {
  const { formatMessage } = useIntl();
  const [values, setValues] = useState([]);
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

  useEffect(() => {
    if (value) {
      setValues(value.split(":::::"));
    }
  }, [value]);

  const handleChange = (e) => {
    setValues(e);
    onChange({
      target: {
        name,
        value: e.join(":::::"),
      },
    });
  };

  return (
    <Stack spacing={1}>
      <MultiSelect
        value={values}
        onValueChange={handleChange}
        label={intlLabel ? formatMessage(intlLabel) : ""}
        placeholder="Select comments"
        customizeContent={({ children }) => {
          return <div>{values.length}</div>;
        }}
      >
        {featuredParentComments?.map((comment) => (
          <MultiSelectOption key={comment.id} value={comment.id}>
            {comment.attributes.name ?? "unknown"} -{" "}
            {comment.attributes.text.slice(0, 50)}
          </MultiSelectOption>
        ))}
      </MultiSelect>
    </Stack>
  );
};

export default AllFeaturedParentComments;

import pluginId from "./pluginId";

const mutateLayouts = (layouts) => {
  return layouts.map((row) => {
    const mutatedRow = row.reduce((acc, field) => {
      const hasMapFieldEnabled =
        field.fieldSchema.pluginOptions?.[pluginId]?.enabled;
      if (!hasMapFieldEnabled) {
        return [...acc, field];
      }
      return [
        ...acc,
        {
          ...field,
          fieldSchema: {
            ...field.fieldSchema,
            type: pluginId,
          },
        },
      ];
    }, []);
    return mutatedRow;
  });
};

const mutateEditViewHook = ({ layout, query }) => {
  const mutateEditLayout = mutateLayouts(layout.contentType.layouts.edit);
  const modifiedLayouts = {
    ...layout.contentType.layouts,
    edit: mutateEditLayout,
  };
  return {
    layout: {
      ...layout,
      contentType: {
        ...layout.contentType,
        layouts: modifiedLayouts,
      },
    },
    query,
  };
};
export default mutateEditViewHook;

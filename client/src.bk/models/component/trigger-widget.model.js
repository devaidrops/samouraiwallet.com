import { baseAPIUrl } from "@/constants/constants";

export class TriggerWidgetModel {
  id;
  icon;
  label;
  tooltip_title;
  tooltip_content;

  constructor(payload) {
    this.id = payload.id;
    this.label = payload.label;
    this.tooltip_title = payload.tooltip_title;
    this.tooltip_content = payload.tooltip_content;
    const iconURL = payload.icon?.data?.attributes?.url
    this.icon = iconURL ? `${baseAPIUrl}${iconURL}` : '';
  }
}

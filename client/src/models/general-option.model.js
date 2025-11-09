import { baseAPIUrl } from '@/constants/constants';
import { TriggerWidgetModel } from "@/models/component/trigger-widget.model";
import { BottomLinkModel } from "@/models/component/bottom-link.model";

export class GeneralOptionModel {
  id;
  author;
  review_comments_title;
  review_social_button_text;
  upvote;
  downvote;
  stars;
  review_options;
  company_info_widgets;
  bottom_icons;
  review_background;
  allow_indexation;
  site_logo;

  constructor(payload) {
    this.id = payload.id;
    this.review_comments_title = payload.attributes.review_comments_title;
    this.review_social_button_text = payload.attributes.review_social_button_text;
    this.upvote = payload.attributes.upvote;
    this.downvote = payload.attributes.downvote;
    this.stars = payload.attributes.stars;
    this.allow_indexation = payload.attributes.allow_indexation;

    const mediaURL = payload.attributes.review_background?.data?.attributes?.url;
    this.review_background = mediaURL ? `${baseAPIUrl}${mediaURL}` : '';

    const logoURL = payload.attributes.site_logo?.data?.attributes?.url;
    this.site_logo = logoURL ? `${baseAPIUrl}${logoURL}` : '';

    const avatarURL = payload.attributes.author?.data?.attributes?.avatar?.data?.attributes?.url;
    this.author = {
      id: payload.attributes.author?.data?.id,
      name: payload.attributes.author?.data?.attributes?.name,
      description: payload.attributes.author?.data?.attributes?.description,
      avatar: avatarURL ? `${baseAPIUrl}${avatarURL}` : ''
    };

    this.review_options = {
      widget_min_deposit_withdrawal: payload.attributes.review_options?.widget_min_deposit_withdrawal ? new TriggerWidgetModel(payload.attributes.review_options?.widget_min_deposit_withdrawal) : null,
      widget_trading_volume: payload.attributes.review_options?.widget_trading_volume ? new TriggerWidgetModel(payload.attributes.review_options?.widget_trading_volume) : null,
      widget_verification: payload.attributes.review_options?.widget_verification ? new TriggerWidgetModel(payload.attributes.review_options?.widget_verification) : null,
      widget_spot_commission: payload.attributes.review_options?.widget_spot_commission ? new TriggerWidgetModel(payload.attributes.review_options?.widget_spot_commission) : null,
      widget_futures_commission: payload.attributes.review_options?.widget_futures_commission ? new TriggerWidgetModel(payload.attributes.review_options?.widget_futures_commission) : null,
    }

    this.company_info_widgets = (payload.attributes.review_options?.company_info_widgets || []).map((item) => new TriggerWidgetModel(item));
    this.bottom_icons = (payload.attributes.bottom_icons || []).map((item) => new BottomLinkModel(item));
  }
}

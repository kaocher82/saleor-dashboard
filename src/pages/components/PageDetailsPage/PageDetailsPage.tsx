import { mergeAttributeValues } from "@saleor/attributes/utils/data";
import AppHeader from "@saleor/components/AppHeader";
import AssignAttributeValueDialog from "@saleor/components/AssignAttributeValueDialog";
import Attributes, { AttributeInput } from "@saleor/components/Attributes";
import CardSpacer from "@saleor/components/CardSpacer";
import { ConfirmButtonTransitionState } from "@saleor/components/ConfirmButton";
import Container from "@saleor/components/Container";
import Grid from "@saleor/components/Grid";
import Metadata from "@saleor/components/Metadata";
import PageHeader from "@saleor/components/PageHeader";
import SaveButtonBar from "@saleor/components/SaveButtonBar";
import SeoForm from "@saleor/components/SeoForm";
import VisibilityCard from "@saleor/components/VisibilityCard";
import { PageErrorWithAttributesFragment } from "@saleor/fragments/types/PageErrorWithAttributesFragment";
import useDateLocalize from "@saleor/hooks/useDateLocalize";
import { SubmitPromise } from "@saleor/hooks/useForm";
import { sectionNames } from "@saleor/intl";
import { getAttributeValuesFromReferences } from "@saleor/pages/utils/data";
import { SearchPages_search_edges_node } from "@saleor/searches/types/SearchPages";
import { SearchPageTypes_search_edges_node } from "@saleor/searches/types/SearchPageTypes";
import { FetchMoreProps } from "@saleor/types";
import React from "react";
import { useIntl } from "react-intl";

import { PageDetails_page } from "../../types/PageDetails";
import PageInfo from "../PageInfo";
import PageOrganizeContent from "../PageOrganizeContent";
import PageForm, { PageData } from "./form";

export interface PageDetailsPageProps {
  loading: boolean;
  errors: PageErrorWithAttributesFragment[];
  page: PageDetails_page;
  pageTypes?: SearchPageTypes_search_edges_node[];
  referencePages: SearchPages_search_edges_node[];
  allowEmptySlug?: boolean;
  saveButtonBarState: ConfirmButtonTransitionState;
  onBack: () => void;
  onRemove: () => void;
  onSubmit: (data: PageData) => SubmitPromise;
  fetchPageTypes?: (data: string) => void;
  fetchMorePageTypes?: FetchMoreProps;
  assignReferencesAttributeId?: string;
  onAssignReferencesClick: (attribute: AttributeInput) => void;
  fetchReferncePages?: (data: string) => void;
  fetchMoreReferencePages?: FetchMoreProps;
  onCloseDialog: () => void;
}

const PageDetailsPage: React.FC<PageDetailsPageProps> = ({
  loading,
  errors,
  page,
  pageTypes,
  referencePages,
  saveButtonBarState,
  onBack,
  onRemove,
  onSubmit,
  fetchPageTypes,
  fetchMorePageTypes,
  assignReferencesAttributeId,
  onAssignReferencesClick,
  fetchReferncePages,
  fetchMoreReferencePages,
  onCloseDialog
}) => {
  const intl = useIntl();
  const localizeDate = useDateLocalize();

  const pageExists = page !== null;

  const openAssignReferencesAttributeDialog = !!assignReferencesAttributeId;

  return (
    <PageForm
      page={page}
      pageTypes={pageTypes}
      referencePages={referencePages}
      onSubmit={onSubmit}
    >
      {({ change, data, pageType, handlers, hasChanged, submit }) => (
        <Container>
          <AppHeader onBack={onBack}>
            {intl.formatMessage(sectionNames.pages)}
          </AppHeader>
          <PageHeader
            title={
              !pageExists
                ? intl.formatMessage({
                    defaultMessage: "Create Page",
                    description: "page header"
                  })
                : page?.title
            }
          />
          <Grid>
            <div>
              <PageInfo
                data={data}
                disabled={loading}
                errors={errors}
                onChange={change}
                onContentChange={handlers.changeContent}
              />
              <CardSpacer />
              <SeoForm
                errors={errors}
                allowEmptySlug={!pageExists}
                description={data.seoDescription}
                disabled={loading}
                descriptionPlaceholder={""} // TODO: Cast description to string and trim it
                onChange={change}
                slug={data.slug}
                slugPlaceholder={data.title}
                title={data.seoTitle}
                titlePlaceholder={data.title}
                helperText={intl.formatMessage({
                  defaultMessage:
                    "Add search engine title and description to make this page easier to find"
                })}
              />
              <CardSpacer />
              {data.attributes.length > 0 && (
                <Attributes
                  attributes={data.attributes}
                  disabled={loading}
                  loading={loading}
                  errors={errors}
                  onChange={handlers.selectAttribute}
                  onMultiChange={handlers.selectAttributeMulti}
                  onFileChange={handlers.selectAttributeFile}
                  onReferencesRemove={handlers.selectAttributeReference}
                  onReferencesAddClick={onAssignReferencesClick}
                />
              )}
              <CardSpacer />
              <Metadata data={data} onChange={handlers.changeMetadata} />
            </div>
            <div>
              <CardSpacer />
              <VisibilityCard
                data={data}
                errors={errors}
                disabled={loading}
                messages={{
                  hiddenLabel: intl.formatMessage({
                    defaultMessage: "Hidden",
                    description: "page label"
                  }),
                  hiddenSecondLabel: intl.formatMessage(
                    {
                      defaultMessage: "will be visible from {date}",
                      description: "page"
                    },
                    {
                      date: localizeDate(data.publicationDate, "L")
                    }
                  ),
                  visibleLabel: intl.formatMessage({
                    defaultMessage: "Visible",
                    description: "page label"
                  })
                }}
                onChange={change}
              />
              <CardSpacer />
              <PageOrganizeContent
                data={data}
                errors={errors}
                disabled={loading}
                pageTypes={pageTypes}
                pageType={pageType}
                pageTypeInputDisplayValue={pageType?.name || ""}
                onPageTypeChange={handlers.selectPageType}
                fetchPageTypes={fetchPageTypes}
                fetchMorePageTypes={fetchMorePageTypes}
                canChangeType={!page?.pageType}
              />
            </div>
          </Grid>
          <SaveButtonBar
            disabled={loading || !hasChanged}
            state={saveButtonBarState}
            onCancel={onBack}
            onDelete={page === null ? undefined : onRemove}
            onSave={submit}
          />
          {openAssignReferencesAttributeDialog && (
            <AssignAttributeValueDialog
              attributeValues={getAttributeValuesFromReferences(
                assignReferencesAttributeId,
                data.attributes,
                referencePages
              )}
              hasMore={fetchMoreReferencePages?.hasMore}
              open={openAssignReferencesAttributeDialog}
              onFetch={fetchReferncePages}
              onFetchMore={fetchMoreReferencePages?.onFetchMore}
              loading={fetchMoreReferencePages?.loading}
              onClose={onCloseDialog}
              onSubmit={attributeValues => {
                handlers.selectAttributeReference(
                  assignReferencesAttributeId,
                  mergeAttributeValues(
                    assignReferencesAttributeId,
                    attributeValues,
                    data.attributes
                  )
                );
                onCloseDialog();
              }}
            />
          )}
        </Container>
      )}
    </PageForm>
  );
};
PageDetailsPage.displayName = "PageDetailsPage";
export default PageDetailsPage;

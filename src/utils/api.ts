const addComment = `mutation($input: AddCommentInput!) { addComment(input: $input) { clientMutationId } }`;
const deleteComment = `mutation($input: DeleteIssueCommentInput!) { deleteIssueComment(input: $input) { clientMutationId } }`;
const editComment = `mutation($input: UpdateIssueCommentInput!) { updateIssueComment(input: $input) { clientMutationId } }`;

const prefix = "\n<!--typescript_bot_";
const suffix = "-->";


const api = () => {
  
}

import React from 'react';

export default function DeleteAccountDescription() {
  return (
    <div>
      <p>
        The following data will be deleted from your account:

        <ul>
          <li>Name - this will be set to "deleted"</li>
          <li>About Me - this will be cleared</li>
          <li>Email Address - this will be cleared</li>
          <li>Avatar Image - this will be cleared</li>
          <li>Password - this will be cleared</li>
        </ul>
      </p>

      <p>
        The following will not be deleted:

        <ul>
          <li>Public Recipes - these will still be visible but will be attributed to a "deleted" user</li>
          <li>Public Comments - these will still be visible but will be attributed to a "deleted" user</li>
          <li>Public Posts - these will still be visible but will be attributed to a "deleted" user</li>
          <li>Public Forums - these will still be visible but will be attributed to a "deleted" user</li>
        </ul>

        To delete any of the above, please visit each recipe, comment, post and forum post and delete these individually.
      </p>

      <p>
        If a deleted account was created via Google login, then it can be recovered by logging in again
        using either the Google login.
      </p>

      <p>
        <strong>
          A deleted account created using Username and Password can never be recovered.
        </strong>
      </p>
    </div>
  );
}

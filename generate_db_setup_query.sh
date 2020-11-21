# This script will generate db schema query required to create
# and setup database and all the tables

# run: mysql -u{user} -h127.0.0.1 -p {database name} -e "$(./generate_db_setup_query.sh)"

cat \
    schemas/create_users_table.sql \
    schemas/add_name_columns_in_users.sql \
    schemas/add_settings_column_in_users.sql \
    schemas/add_populate_status_columns_in_users.sql \
    schemas/add_mailgun_columns_in_users.sql \
    \
    schemas/create_user_emails_table.sql \
    schemas/add_preview_columns_in_user_emails_table.sql \
    schemas/index_several_columns_of_user_emails_table.sql \
    schemas/add_config_column_in_user_emails.sql \
    schemas/add_originalStyle_and_cleanStyle_columns_in_user_emails.sql \
    schemas/add_originalContent_column_in_user_emails.sql \
    \
    schemas/create_email_headers.sql \
    \
    schemas/create_gmail_newsletter_filters.sql \
    schemas/populate_gmail_newsletter_filters.sql \
    \
    schemas/create_highlights_table.sql \
    \
    schemas/create_newsletter_table.sql \
    schemas/add_visible_columns_in_newsletters.sql \
    schemas/index_visible_column_of_newsletters_table.sql \
    schemas/add_verified_column_in_newsletters_table.sql \
    \
    schemas/create_gmail_query_audit_log.sql
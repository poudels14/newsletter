INSERT INTO gmail_newsletter_filters(filter)
VALUES
('from:substack.com'),
('from:stratechery.com'),
('from:dailydigest@atom.finance'),
('from:morningbrew.com'),
-- subash dai's filters
('from:noreply@mail.bloombergview.com'),
('from:rangewidely@gmail.com'),
('from:nick@ritholtzwealth.com'),
('from:kris@moontowermeta.com'),
('from:annelaure@nesslabs.com'),
('from:contact@moretothat.com')
-- end of sbash dai's filters

ON DUPLICATE KEY update filter=filter;
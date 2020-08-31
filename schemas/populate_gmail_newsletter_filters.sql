INSERT INTO gmail_newsletter_filters(filter)
VALUES
('from:substack.com'),
('from:stratechery.com'),
('from:dailydigest@atom.finance'),
('from:morningbrew.com'),
-- sagar's filters
('from:david@perell.com'),
('from:corey@lastweekinaws.com'),
('from:cassidy@cassidoo.co'),
-- end of sagar's filters
-- subash dai's filters
('from:noreply@mail.bloombergview.com'),
('from:rangewidely@gmail.com'),
('from:nick@ritholtzwealth.com'),
('from:kris@moontowermeta.com'),
('from:annelaure@nesslabs.com'),
('from:contact@moretothat.com')
-- end of subash dai's filters

ON DUPLICATE KEY update filter=filter;
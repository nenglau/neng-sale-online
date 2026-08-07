-- Add gas_url column to companies table for storing Google Apps Script URL
alter table companies
  add column if not exists gas_url text;

-- Add exported_to_sheet column to sales table for auto-export tracking
alter table sales
  add column if not exists exported_to_sheet boolean not null default false;

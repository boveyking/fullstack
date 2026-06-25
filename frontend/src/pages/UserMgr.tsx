import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Tabs, Table, Badge, Title, Paper, LoadingOverlay, Pagination, Group, Text, Box, Checkbox, Modal, Switch, TextInput, ActionIcon } from '@mantine/core';
import { X } from 'lucide-react';
import { getOrganizations, updateOrganizationStatus, Organization, getUsers, User } from '../services/api';
import '../components/ContactPopup.css';
import './UserMgr.css';

const ITEMS_PER_PAGE = 10;

export default function UserMgr() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState<string | null>(tabParam || 'organizations');
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activePage, setActivePage] = useState(1);
  const [usersPage, setUsersPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalUsersRecords, setTotalUsersRecords] = useState(0);
  const [showPending, setShowPending] = useState(false);
  const [showActive, setShowActive] = useState(false);
  const [modalOpened, setModalOpened] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [organizationFilter, setOrganizationFilter] = useState('');
  const [userNameFilter, setUserNameFilter] = useState('');

  const fetchOrganizations = useCallback(async (page: number = 1) => {
    setLoading(true);
    setError(null);
    try {
      const offset = (page - 1) * ITEMS_PER_PAGE;
      console.log(`Fetching organizations... page ${page}, offset ${offset}, length ${ITEMS_PER_PAGE}`);
      const data = await getOrganizations(offset, ITEMS_PER_PAGE);
      console.log('Organizations fetched:', data);
      setOrganizations(data.items);
      setTotalRecords(data.total);
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to fetch organizations';
      setError(errorMessage);
      console.error('Error fetching organizations:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUsers = useCallback(async (page: number = 1) => {
    setLoading(true);
    setError(null);
    try {
      const offset = (page - 1) * ITEMS_PER_PAGE;
      console.log(`Fetching users... page ${page}, offset ${offset}, length ${ITEMS_PER_PAGE}`);
      const data = await getUsers(offset, ITEMS_PER_PAGE);
      console.log('Users fetched:', data);
      setUsers(data.items);
      setTotalUsersRecords(data.total);
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to fetch users';
      setError(errorMessage);
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Update activeTab when URL parameter changes
  useEffect(() => {
    if (tabParam && (tabParam === 'organizations' || tabParam === 'users')) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  useEffect(() => {
    if (activeTab === 'organizations') {
      setActivePage(1);
      fetchOrganizations(1);
    } else if (activeTab === 'users') {
      setUsersPage(1);
      fetchUsers(1);
    }
  }, [activeTab, fetchOrganizations, fetchUsers]);

  useEffect(() => {
    if (activeTab === 'organizations') {
      fetchOrganizations(activePage);
    }
  }, [activePage, activeTab, fetchOrganizations]);

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers(usersPage);
    }
  }, [usersPage, activeTab, fetchUsers]);

  const handlePageChange = (page: number) => {
    setActivePage(page);
  };

  const handleUsersPageChange = (page: number) => {
    setUsersPage(page);
  };

  const handleBadgeClick = (org: Organization) => {
    setSelectedOrg(org);
    setModalOpened(true);
  };

  const handleStatusChange = async (checked: boolean) => {
    if (!selectedOrg) return;

    const newStatus = checked ? 'active' : 'pending';
    setUpdatingStatus(true);
    
    try {
      const updatedOrg = await updateOrganizationStatus(selectedOrg.id, newStatus);
      
      // Update the organization in the local state
      setOrganizations(prevOrgs => 
        prevOrgs.map(org => 
          org.id === updatedOrg.id ? updatedOrg : org
        )
      );
      
      // Update selected org to reflect the change
      setSelectedOrg(updatedOrg);
      
      // Close the modal after successful update
      setTimeout(() => {
        setModalOpened(false);
        setSelectedOrg(null);
      }, 500); // Small delay to show the update was successful
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to update organization status';
      setError(errorMessage);
      console.error('Error updating organization status:', err);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  // Filter organizations based on checkbox states
  const filteredOrganizations = organizations.filter((org) => {
    const status = org.status?.toLowerCase() || '';
    
    // If both checkboxes are unchecked, show all
    if (!showPending && !showActive) {
      return true;
    }
    
    // If only pending is checked, show only pending
    if (showPending && !showActive) {
      return status === 'pending';
    }
    
    // If only active is checked, show only active
    if (!showPending && showActive) {
      return status === 'active';
    }
    
    // If both are checked, show both pending and active
    return status === 'pending' || status === 'active';
  });

  // Filter users based on organization and user name filters
  const filteredUsers = users.filter((user) => {
    // Filter by organization (only if more than 3 characters)
    if (organizationFilter.length > 3) {
      const orgName = user.org_name?.toLowerCase() || '';
      const filterLower = organizationFilter.toLowerCase();
      if (!orgName.includes(filterLower)) {
        return false;
      }
    }
    
    // Filter by user name (only if more than 3 characters)
    if (userNameFilter.length > 3) {
      const userName = user.user_name?.toLowerCase() || '';
      const filterLower = userNameFilter.toLowerCase();
      if (!userName.includes(filterLower)) {
        return false;
      }
    }
    
    return true;
  });

  const rows = filteredOrganizations.map((org, index) => (
    <Table.Tr 
      key={org.id}
      style={{
        backgroundColor: index % 2 === 0 ? '#0a0a0a' : '#1a1a1a',
      }}
    >
      <Table.Td><Text>{org.id}</Text></Table.Td>
      <Table.Td><Text>{org.org_name || 'N/A'}</Text></Table.Td>
      <Table.Td style={{ maxWidth: '50%', width: '50%', wordWrap: 'break-word', overflowWrap: 'break-word' }}><Text style={{ wordBreak: 'break-word' }}>{org.org_desc || 'N/A'}</Text></Table.Td>
      <Table.Td><Text>{org.city || 'N/A'}</Text></Table.Td>

      <Table.Td>
        <Badge 
          color={org.status === 'active' ? 'green' : 'yellow'}
          style={{ 
            minWidth: 'fit-content',
            whiteSpace: 'nowrap',
            width: 'auto',
            display: 'inline-block',
            cursor: 'pointer'
          }}
          onClick={() => handleBadgeClick(org)}
        >
          {org.status || 'N/A'}
        </Badge>
      </Table.Td>

{/*       <Table.Td><Text>{org.is_active ? 'Yes' : 'No'}</Text></Table.Td> */}
      <Table.Td><Text>{org.is_public ? 'Yes' : 'No'}</Text></Table.Td>
{/*       <Table.Td><Text>{org.address_id || 'N/A'}</Text></Table.Td> */}
      <Table.Td><Text>{formatDateTime(org.create_datetime)}</Text></Table.Td>
    </Table.Tr>
  ));

  return (
    
      <Box  >
        <Paper 
          style={{ 
            backgroundColor: '#0a0a0a',
            border: '1px solid #222',
            borderRadius: '30px',
            padding: '2.5rem',
            position: 'relative'
          }}
        >
          <LoadingOverlay visible={loading} />
          
          <Title 
            order={2} 
            style={{ 
              fontFamily: 'var(--accent-font)',
              color: '#fff',
              marginBottom: '2rem'
            }}
          >
            User Management
          </Title>

          {error && (
            <div style={{ 
              color: 'red', 
              padding: '10px', 
              marginBottom: '20px', 
              backgroundColor: '#ffe6e6', 
              borderRadius: '4px' 
            }}>
              {error}
            </div>
          )}

          <Tabs 
            value={activeTab} 
            onChange={(value) => {
              setActiveTab(value);
              // Update URL parameter when tab changes
              if (value) {
                setSearchParams({ tab: value });
              }
            }}
            
            styles={{
              list: {
                /* borderBottom: '1px solid #333', */
              },
              tab: {
                color: '#999 !important',
                backgroundColor: 'transparent',
                borderBottom: 'none !important',
                '&[data-active]': {
                  color: '#fff !important',
                  borderBottom: '3px solid #51cf66 !important',
                },
                '&:not([data-active])': {
                  borderBottom: 'none !important',
                },
                '&:hover': {
                  color: '#ccc !important',
                  backgroundColor: 'transparent',
                },
              },
            }}
          >
              
            <Group justify="space-between" style={{ width: '100%' }}>
              <Tabs.List>
                <Tabs.Tab 
                  value="organizations"
                  style={{ 
                    color: activeTab === 'organizations' ? '#fff' : '#999',
                    borderBottom: activeTab === 'organizations' ? '3px solid #51cf66' : 'none',
                  }}
                >
                 <Text size="xl">Organization</Text>
                </Tabs.Tab>
                <Tabs.Tab 
                  value="users"
                  style={{ 
                    color: activeTab === 'users' ? '#fff' : '#999',
                    borderBottom: activeTab === 'users' ? '3px solid #51cf66' : 'none',
                  }}
                >
                  <Text size="xl">Users</Text>
                </Tabs.Tab>
              </Tabs.List>
              {activeTab === 'organizations' && (
                <Group gap="md">
                  <Checkbox
                    label="Pending"
                    checked={showPending}
                    onChange={(event) => setShowPending(event.currentTarget.checked)}
                    styles={{
                      label: {
                        color: '#fff',
                      },
                      input: {
                        backgroundColor: '#1a1a1a',
                        borderColor: '#333',
                      },
                    }}
                  />
                  <Checkbox
                    label="Active"
                    checked={showActive}
                    onChange={(event) => setShowActive(event.currentTarget.checked)}
                    styles={{
                      label: {
                        color: '#fff',
                      },
                      input: {
                        backgroundColor: '#1a1a1a',
                        borderColor: '#333',
                      },
                    }}
                  />
                </Group>
              )}
                {activeTab === 'users' && (
                <Group gap="md">
                  <TextInput
                    placeholder="Filter by Organization"
                    value={organizationFilter}
                    onChange={(event) => setOrganizationFilter(event.currentTarget.value)}
                    rightSection={
                      organizationFilter && (
                        <ActionIcon
                          onClick={() => setOrganizationFilter('')}
                          variant="transparent"
                          style={{ color: '#999', cursor: 'pointer' }}
                          size="sm"
                        >
                          <X size={16} />
                        </ActionIcon>
                      )
                    }
                    styles={{
                      input: {
                        backgroundColor: '#1a1a1a',
                        borderColor: '#333',
                        color: '#fff',
                        '&::placeholder': {
                          color: '#666',
                        },
                        '&:focus': {
                          borderColor: '#51cf66',
                        },
                      },
                    }}
                  />
                  <TextInput
                    placeholder="Filter by User Name"
                    value={userNameFilter}
                    onChange={(event) => setUserNameFilter(event.currentTarget.value)}
                    rightSection={
                      userNameFilter && (
                        <ActionIcon
                          onClick={() => setUserNameFilter('')}
                          variant="transparent"
                          style={{ color: '#999', cursor: 'pointer' }}
                          size="sm"
                        >
                          <X size={16} />
                        </ActionIcon>
                      )
                    }
                    styles={{
                      input: {
                        backgroundColor: '#1a1a1a',
                        borderColor: '#333',
                        color: '#fff',
                        '&::placeholder': {
                          color: '#666',
                        },
                        '&:focus': {
                          borderColor: '#51cf66',
                        },
                      },
                    }}
                  />
                </Group>
              )}
            </Group>
            {/* <Divider /> */}
            <Tabs.Panel value="organizations" pt="xl">
              <Table 
                striped 
                
                highlightOnHover
                style={{
                  backgroundColor: '#0a0a0a',
                  color: '#fff',
                  tableLayout: 'fixed',
                  width: '100%',
                }}
                styles={{
                  thead: {
                    backgroundColor: '#1a1a1a',
                  },
                  th: {
                    color: '#999',
                    borderBottom: '1px solid #333',
                  },
                  td: {
                    color: '#fff',
                    borderBottom: '1px solid #333',
                    padding: '18px 14px', // Increase row height
                  },
                  tbody: {
                    '& tr:nth-of-type(odd)': {
                      backgroundColor: '#1a1a1a',
                    },
                    '& tr:nth-of-type(even)': {
                      backgroundColor: '#0a0a0a',
                    },
                    '& tr:hover': {
                      backgroundColor: '#252525',
                    },
                  },
                }}
              >
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th style={{ color: '#999' }}><Text size="19px">ID</Text></Table.Th>
                    <Table.Th style={{ color: '#999' }}><Text size="19px">Organization Name</Text></Table.Th>
                    <Table.Th style={{ color: '#999', maxWidth: '50%', width: '50%' }}><Text size="19px">Description</Text></Table.Th>
                    <Table.Th style={{ color: '#999' }}><Text size="19px">City</Text></Table.Th>
                    <Table.Th style={{ color: '#999' }}><Text size="19px">Status</Text></Table.Th>
                  {/*   <Table.Th style={{ color: '#999' }}>Active</Table.Th> */}
                    <Table.Th style={{ color: '#999' }}><Text size="19px">Public</Text></Table.Th>
                {/*     <Table.Th style={{ color: '#999' }}>Address ID</Table.Th> */}
                    <Table.Th style={{ color: '#999' }}><Text size="19px">Date</Text></Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {filteredOrganizations.length === 0 && !loading ? (
                    <Table.Tr>
                      <Table.Td colSpan={7} style={{ textAlign: 'center', color: 'white' }}>
                        <Text style={{ color: '#fff' }}>No organizations found</Text>
                      </Table.Td>
                    </Table.Tr>
                  ) : (
                    rows
                  )}
                </Table.Tbody>
              </Table>
              
              {totalRecords > 0 && (
                <Group justify="space-between" mt="xl" style={{ color: '#999', width: '100%' }}>
                  <Text size="sm" style={{ color: '#999', minWidth: '200px', flexShrink: 0 }}>
                    Showing {(activePage - 1) * ITEMS_PER_PAGE + 1} to{' '}
                    {Math.min(activePage * ITEMS_PER_PAGE, totalRecords)} of {totalRecords} organizations
                  </Text>
                  <Pagination
                    total={Math.ceil(totalRecords / ITEMS_PER_PAGE)}
                    value={activePage}
                    onChange={handlePageChange}
                    styles={{
                      root: {
                        width: 'auto',
                        minWidth: 'fit-content',
                        flexShrink: 0,
                      },
                      control: {
                        '&[data-active="true"]': {
                          backgroundColor: '#fff',
                          color: '#ff0000',
                        },
                        '&[data-active]': {
                          backgroundColor: '#fff',
                          color: '#ff0000',
                        },
                        color: '#999',
                        borderColor: '#333',
                        '&:hover': {
                          backgroundColor: '#1a1a1a',
                          color: '#fff',
                        },
                        '&:hover[data-active]': {
                          backgroundColor: '#fff',
                          color: '#ff0000',
                        },
                      },
                      dots: {
                        color: '#999',
                      },
                    }}
                  />
                </Group>
              )}
            </Tabs.Panel>

            <Tabs.Panel value="users" pt="xl">
              <Table 
                striped 
                highlightOnHover
                style={{
                  backgroundColor: '#0a0a0a',
                  color: '#fff',
                }}
                styles={{
                  thead: {
                    backgroundColor: '#1a1a1a',
                  },
                  th: {
                    color: '#999',
                    borderBottom: '1px solid #333',
                  },
                  td: {
                    color: '#fff',
                    borderBottom: '1px solid #333',
                    padding: '18px 14px',
                  },
                  tbody: {
                    '& tr:nth-of-type(odd)': {
                      backgroundColor: '#1a1a1a',
                    },
                    '& tr:nth-of-type(even)': {
                      backgroundColor: '#0a0a0a',
                    },
                    '& tr:hover': {
                      backgroundColor: '#252525',
                    },
                  },
                }}
              >
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th style={{ color: '#999' }}><Text size="19px">User Name</Text></Table.Th>
                    <Table.Th style={{ color: '#999' }}><Text size="19px">Full Name</Text></Table.Th>
                    <Table.Th style={{ color: '#999' }}><Text size="19px">Email</Text></Table.Th>
                    <Table.Th style={{ color: '#999' }}><Text size="19px">Title</Text></Table.Th>
                    <Table.Th style={{ color: '#999' }}><Text size="19px">Active</Text></Table.Th>
                    <Table.Th style={{ color: '#999' }}><Text size="19px">Organization</Text></Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {filteredUsers.length === 0 && !loading ? (
                    <Table.Tr>
                      <Table.Td colSpan={6} style={{ textAlign: 'center', backgroundColor: '#1a1a1a' }}>
                        <Text style={{ color: '#fff' }}>No users found</Text>
                      </Table.Td>
                    </Table.Tr>
                  ) : (
                    filteredUsers.map((user, index) => (
                      <Table.Tr 
                        key={user.id}
                        style={{
                          backgroundColor: index % 2 === 0 ? '#0a0a0a' : '#1a1a1a',
                        }}
                      >
                        <Table.Td><Text>{user.user_name || 'N/A'}</Text></Table.Td>
                        <Table.Td><Text>{user.name || 'N/A'}</Text></Table.Td>
                        <Table.Td><Text>{user.email || 'N/A'}</Text></Table.Td>
                        <Table.Td><Text>{user.title || 'N/A'}</Text></Table.Td>
                        <Table.Td>
                          <Badge 
                            color={user.is_active ? 'green' : 'red'}
                            style={{ 
                              minWidth: 'fit-content',
                              whiteSpace: 'nowrap',
                              width: 'auto',
                              display: 'inline-block',
                            }}
                          >
                            {user.is_active ? 'Yes' : 'No'}
                          </Badge>
                        </Table.Td>
                        <Table.Td><Text>{user.org_name || 'N/A'}</Text></Table.Td>
                      </Table.Tr>
                    ))
                  )}
                </Table.Tbody>
              </Table>
              
              {totalUsersRecords > 0 && (
                <Group justify="space-between" mt="xl" style={{ color: '#999', width: '100%' }}>
                  <Text size="sm" style={{ color: '#999', minWidth: '200px', flexShrink: 0 }}>
                    Showing {(usersPage - 1) * ITEMS_PER_PAGE + 1} to{' '}
                    {Math.min(usersPage * ITEMS_PER_PAGE, totalUsersRecords)} of {totalUsersRecords} users
                  </Text>
                  <Pagination
                    total={Math.ceil(totalUsersRecords / ITEMS_PER_PAGE)}
                    value={usersPage}
                    onChange={handleUsersPageChange}
                    styles={{
                      root: {
                        width: 'auto',
                        minWidth: 'fit-content',
                        flexShrink: 0,
                      },
                      control: {
                        '&[data-active="true"]': {
                          backgroundColor: '#fff',
                          color: '#ff0000',
                        },
                        '&[data-active]': {
                          backgroundColor: '#fff',
                          color: '#ff0000',
                        },
                        color: '#999',
                        borderColor: '#333',
                        '&:hover': {
                          backgroundColor: '#1a1a1a',
                          color: '#fff',
                        },
                        '&:hover[data-active]': {
                          backgroundColor: '#fff',
                          color: '#ff0000',
                        },
                      },
                      dots: {
                        color: '#999',
                      },
                    }}
                  />
                </Group>
              )}
            </Tabs.Panel>
          </Tabs>

          <Modal
            opened={modalOpened}
            onClose={() => setModalOpened(false)}
            title="Organization Status Management"
            centered
            overlayProps={{
              backgroundOpacity: 0.9,
            }}
            styles={{
              title: {
                color: '#fff',
                fontSize: '1.25rem',
                fontWeight: 600,
                textAlign: 'center',
                width: '100%',
              },
              content: {
                backgroundColor: '#0a0a0a',
              },
              header: {
                backgroundColor: '#1a1a1a',
                borderBottom: '1px solid #333',
                display: 'flex',
                justifyContent: 'center',
              },
              body: {
                backgroundColor: '#0a0a0a',
                textAlign: 'center',
                minHeight: '220px',
                padding: '2rem',
              },
            }}
          >
            {selectedOrg && (
              <Box style={{ textAlign: 'center' }}>
                <Text size="sm" pt="md" pb="md" style={{ color: '#999', marginBottom: '1rem', textAlign: 'center' }}>
                  Organization: <Text span style={{ color: '#fff' }}>{selectedOrg.org_name || 'N/A'}</Text>
                </Text>
                <Group justify="center" style={{ marginBottom: '1rem' }}>
                  <Text style={{ color: '#fff' }}>Status:</Text>
                  <Switch
                    checked={selectedOrg.status?.toLowerCase() === 'active'}
                    onChange={(event) => handleStatusChange(event.currentTarget.checked)}
                    disabled={updatingStatus}
                    label={selectedOrg.status?.toLowerCase() === 'active' ? 'Active' : 'Pending'}
                    styles={{
                      label: {
                        color: '#fff',
                      },
                      track: {
                        backgroundColor: selectedOrg.status?.toLowerCase() === 'active' ? '#51cf66' : '#ffd43b',
                      },
                    }}
                  />
                 <Text size="sm" pt="md" pb="md" style={{ color: '#999', marginBottom: '1rem', textAlign: 'center' }}>
                   Toggle Above Switch to Approve or Disapprove the Organization .</Text>
                
                </Group>
                {updatingStatus && (
                  <Text size="sm" style={{ color: '#999', marginTop: '1rem', textAlign: 'center' }}>
                    Updating status...
                  </Text>
                )}

              </Box>
            )}
          </Modal>
        </Paper>
      </Box>
    
  );
}


"use client";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import PageContainer from "@/components/container/PageContainer";
// components
import SalesOverview from "@/features/dashboard/components/SalesOverview";
import YearlyBreakup from "@/features/dashboard/components/YearlyBreakup";
import RecentTransactions from "@/features/dashboard/components/RecentTransactions";
import ProductPerformance from "@/features/dashboard/components/ProductPerformance";
import Blog from "@/features/dashboard/components/Blog";
import MonthlyEarnings from "@/features/dashboard/components/MonthlyEarnings";

export default function Dashboard() {
  return (
    (<PageContainer title="Dashboard" description="this is Dashboard">
      <Box mt={3}>
        <Grid container spacing={3}>
          <Grid
            size={{
              xs: 12,
              lg: 8
            }}>
            <SalesOverview />
          </Grid>
          <Grid
            size={{
              xs: 12,
              lg: 4
            }}>
            <Grid container spacing={3}>
              <Grid size={12}>
                <YearlyBreakup />
              </Grid>
              <Grid size={12}>
                <MonthlyEarnings />
              </Grid>
            </Grid>
          </Grid>
          <Grid
            size={{
              xs: 12,
              lg: 4
            }}>
            <RecentTransactions />
          </Grid>
          <Grid
            size={{
              xs: 12,
              lg: 8
            }}>
            <ProductPerformance />
          </Grid>
          <Grid size={12}>
            <Blog />
          </Grid>
        </Grid>
      </Box>
    </PageContainer>)
  );
}
